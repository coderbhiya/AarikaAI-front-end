import { test, expect } from "@playwright/test";
import { mapCompanyPaper, isCompanyExam } from "../src/services/assessment/companyPaper";
import { AssessmentGenerationQueue } from "../src/services/assessment/AssessmentGenerationQueue";
import { AssessmentQuestionRepository, type AssessmentBlueprint, type Question } from "../src/services/assessment/AssessmentQuestionRepository";
import { gradeCodingAnswer, gradeCodingAnswers, type RunCodeFn } from "../src/services/assessment/codingGrade";

// Plain logic tests (no browser, no backend): they run under the Playwright
// runner because the frontend has no separate unit-test runner.

const PAPER = {
  sections: [
    { name: "Code Debugging", type: "mcq", questions: [
      { id: 2000, question: "What does [] + [] give in JS?", options: ['""', "[]", "0", "NaN"], correctAnswer: '""', explanation: "Both become empty strings." },
      { id: 2001, question: "Big-O of binary search?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], correctAnswer: "O(log n)", explanation: "Halves each step." },
    ] },
    { name: "Hands-on Coding (DSA)", type: "coding", questions: [
      { id: 101, title: "Second Largest", problemStatement: "Return the second largest distinct value.", constraints: "N <= 10^5",
        sampleTestCases: [{ input: "[3, 1, 4]", output: "3" }, { input: 5, output: "x" }], hiddenTestToken: "v1.a.b.c", hiddenTestCount: 4, testCasesVerified: true,
        starterCode: { javascript: "function solution(input) {}" } },
    ] },
    { name: "Work Simulation", type: "behavioral", questions: [
      { id: 901, scenario: "Tell me about a tight deadline.", targetCompetency: "Ownership" },
    ] },
  ],
};

test.describe("company paper mapping", () => {
  test("every question gets an explicit type, in paper order", () => {
    const qs = mapCompanyPaper(PAPER);
    expect(qs.map((q) => q.type)).toEqual(["mcq", "mcq", "coding", "long_answer"]);
    expect(qs[0]).toMatchObject({ question: "What does [] + [] give in JS?", correctAnswer: '""', options: ['""', "[]", "0", "NaN"] });
    expect(qs[2]).toMatchObject({ _id: 101, hiddenTestToken: "v1.a.b.c", hiddenTestCount: 4, constraints: "N <= 10^5" });
    // Malformed test cases (non-string input) are dropped.
    expect(qs[2].testCases).toEqual([{ input: "[3, 1, 4]", output: "3" }]);
    expect(qs[3]).toMatchObject({ question: "Tell me about a tight deadline.", maxMarks: 5 });
    expect(qs[3].explanation).toContain("Ownership");
  });

  test("recognises company exams", () => {
    expect(isCompanyExam("Amazon SDE OA")).toBe(true);
    expect(isCompanyExam("Accenture Cognitive & Coding")).toBe(true);
    expect(isCompanyExam("IIT JEE")).toBe(false);
  });
});

test.describe("generation queue", () => {
  const blueprint: AssessmentBlueprint = {
    exam: "Amazon SDE OA",
    questions: 4,
    durationMinutes: 10,
    difficulty: { easy: 0, medium: 4, hard: 0 },
    distribution: { General: 4 },
  };
  const waitFor = async (cond: () => boolean, ms = 2000) => {
    for (let t = 0; t < ms && !cond(); t += 10) await new Promise((r) => setTimeout(r, 10));
  };

  test("fetches a company paper once per session and stores every question", async () => {
    let calls = 0;
    const repo = new AssessmentQuestionRepository(`logic-test-${Date.now()}`);
    const queue = new AssessmentGenerationQueue(repo, blueprint, undefined, async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 20));
      return mapCompanyPaper(PAPER);
    });
    queue.prefetchQuestions(0); // queues 4 indexes, 3 at a time
    await waitFor(() => [0, 1, 2, 3].every((i) => queue.getStatus(i) === "READY"));
    expect([0, 1, 2, 3].map((i) => queue.getStatus(i))).toEqual(["READY", "READY", "READY", "READY"]);
    queue.prefetchQuestions(2);
    await new Promise((r) => setTimeout(r, 30));
    expect(calls).toBe(1);
    expect(repo.getQuestion(2)?.type).toBe("coding");
    expect(repo.getQuestion(3)?.type).toBe("long_answer");
  });

  test("a failed paper request is retried on the next attempt", async () => {
    let calls = 0;
    const repo = new AssessmentQuestionRepository(`logic-test-fail-${Date.now()}`);
    const small = { ...blueprint, questions: 1 };
    const queue = new AssessmentGenerationQueue(repo, small, undefined, async () => {
      calls++;
      if (calls === 1) throw new Error("network");
      return mapCompanyPaper(PAPER);
    });
    // First attempt fails, falls back to generated questions (which also fail here: no backend) → FAILED.
    queue.prefetchQuestions(0);
    // (The generated-question fallback has no backend here: it fails after its retries, ~3 s.)
    await waitFor(() => queue.getStatus(0) === "FAILED" || queue.getStatus(0) === "READY", 10_000);
    queue.forceRetry(0);
    await waitFor(() => queue.getStatus(0) === "READY");
    expect(calls).toBe(2);
    expect(repo.getQuestion(0)?.type).toBe("mcq");
  });
});

test.describe("coding scores", () => {
  const q = mapCompanyPaper(PAPER)[2] as Question;
  const okRun = { code: "A", language: "javascript", supported: true, passedCount: 5, totalTestCases: 5, allPassed: true };

  test("reuses the last Run result when the submitted code is unchanged", async () => {
    let runs = 0;
    const runCode: RunCodeFn = async () => { runs++; return {}; };
    const g = await gradeCodingAnswer({ question: q, answer: "A", lastRun: okRun, language: "javascript", maxMarks: 2, runCode });
    expect(runs).toBe(0);
    expect(g).toMatchObject({ status: "graded", passedCount: 5, totalTestCases: 5, allPassed: true, marksAwarded: 2, maxMarks: 2 });
  });

  test("runs the final code again when it changed after the last Run, with hidden cases", async () => {
    let body: any = null;
    const runCode: RunCodeFn = async (b) => { body = b; return { supported: true, passedCount: 2, totalTestCases: 5, allPassed: false }; };
    const g = await gradeCodingAnswer({ question: q, answer: "B", lastRun: okRun, language: "javascript", maxMarks: 2, runCode });
    expect(body).toMatchObject({ code: "B", language: "javascript", testCases: [{ input: "[3, 1, 4]", output: "3" }], hiddenTestToken: "v1.a.b.c" });
    expect(g).toMatchObject({ status: "graded", passedCount: 2, totalTestCases: 5, allPassed: false, marksAwarded: 0.8 });
  });

  test("not attempted, no test cases, unsupported language and runner failures score 0", async () => {
    const fail: RunCodeFn = async () => { throw new Error("503"); };
    const unsupported: RunCodeFn = async () => ({ supported: false, passedCount: 0, totalTestCases: 5 });
    expect((await gradeCodingAnswer({ question: q, answer: "  ", language: "javascript", maxMarks: 2, runCode: fail })).status).toBe("not_attempted");
    const noTests = { ...q, testCases: [], hiddenTestToken: null };
    expect((await gradeCodingAnswer({ question: noTests, answer: "x", language: "javascript", maxMarks: 2, runCode: fail })).status).toBe("no_tests");
    const u = await gradeCodingAnswer({ question: q, answer: "x", language: "python", maxMarks: 2, runCode: unsupported });
    expect(u).toMatchObject({ status: "unsupported", marksAwarded: 0 });
    const f = await gradeCodingAnswer({ question: q, answer: "x", language: "javascript", maxMarks: 2, runCode: fail });
    expect(f).toMatchObject({ status: "failed", marksAwarded: 0 });
  });

  test("grades several questions one run at a time", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const runCode: RunCodeFn = async () => {
      inFlight++; maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 10));
      inFlight--;
      return { supported: true, passedCount: 1, totalTestCases: 1, allPassed: true };
    };
    const grades = await gradeCodingAnswers({
      questions: [{ idx: 2, q }, { idx: 5, q }],
      answers: { 2: "a", 5: "b" },
      lastRuns: {},
      language: "javascript",
      maxMarks: 2,
      runCode,
    });
    expect(Object.keys(grades)).toEqual(["2", "5"]);
    expect(maxInFlight).toBe(1);
  });
});
