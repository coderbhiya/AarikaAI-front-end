import type { Question } from "./AssessmentQuestionRepository";

/**
 * Scores coding answers at submit time from the question's own test cases
 * (visible examples + hidden cases), the same way "Run Code" does.
 *
 * The score is the result of running the code the candidate actually
 * submitted: the last Run result is reused when the code and language are
 * unchanged since that run; otherwise (edited after running, or never run)
 * the final code is run once more. Marks are partial: passed / total.
 */

/** What a Run Code response tells us, kept per question. */
export interface CodeRunSnapshot {
  code: string;
  language: string;
  supported: boolean;
  passedCount: number;
  totalTestCases: number;
  allPassed: boolean;
}

export type CodingGradeStatus = "graded" | "not_attempted" | "no_tests" | "unsupported" | "failed";

export interface CodingGrade {
  status: CodingGradeStatus;
  passedCount: number;
  totalTestCases: number;
  allPassed: boolean;
  marksAwarded: number;
  maxMarks: number;
  language: string;
  feedback: string;
}

export type RunCodeFn = (args: {
  code: string;
  language: string;
  testCases: { input: string; output: string }[];
  hiddenTestToken?: string;
}) => Promise<{ supported?: boolean; passedCount?: number; totalTestCases?: number; allPassed?: boolean }>;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const snapshotFromRunResult = (code: string, language: string, data: any): CodeRunSnapshot => ({
  code,
  language,
  supported: data?.supported !== false,
  passedCount: Number(data?.passedCount) || 0,
  totalTestCases: Number(data?.totalTestCases) || 0,
  allPassed: !!data?.allPassed,
});

export const gradeFromSnapshot = (run: CodeRunSnapshot, maxMarks: number): CodingGrade => {
  if (!run.supported) {
    return {
      status: "unsupported", passedCount: 0, totalTestCases: run.totalTestCases, allPassed: false,
      marksAwarded: 0, maxMarks, language: run.language,
      feedback: `${run.language} answers can't be run here yet, so this answer couldn't be scored. Only JavaScript is checked automatically.`,
    };
  }
  const total = run.totalTestCases;
  const passed = Math.min(run.passedCount, total);
  const allPassed = total > 0 && passed === total;
  return {
    status: "graded", passedCount: passed, totalTestCases: total, allPassed,
    marksAwarded: total > 0 ? round2((maxMarks * passed) / total) : 0,
    maxMarks, language: run.language,
    feedback: `Passed ${passed}/${total} test cases.`,
  };
};

const hasTests = (q: Question) => (q.testCases?.length || 0) > 0 || !!q.hiddenTestToken;

/**
 * Grades one coding question. `answer` is the submitted code (undefined if
 * the candidate never typed anything), `lastRun` the latest Run Code result
 * for this question, if any.
 */
export const gradeCodingAnswer = async ({
  question,
  answer,
  lastRun,
  language,
  maxMarks,
  runCode,
}: {
  question: Question;
  answer: string | undefined;
  lastRun?: CodeRunSnapshot;
  language: string;
  maxMarks: number;
  runCode: RunCodeFn;
}): Promise<CodingGrade> => {
  const empty = { passedCount: 0, totalTestCases: 0, allPassed: false, marksAwarded: 0, maxMarks, language };
  if (!answer || !answer.trim()) {
    return { ...empty, status: "not_attempted", feedback: "Not attempted." };
  }
  if (!hasTests(question)) {
    return { ...empty, status: "no_tests", feedback: "This question has no test cases, so it couldn't be scored automatically." };
  }
  if (lastRun && lastRun.code === answer && lastRun.language === language) {
    return gradeFromSnapshot(lastRun, maxMarks);
  }
  try {
    const data = await runCode({
      code: answer,
      language,
      testCases: (question.testCases || []).map(({ input, output }) => ({ input, output })),
      ...(question.hiddenTestToken ? { hiddenTestToken: question.hiddenTestToken } : {}),
    });
    return gradeFromSnapshot(snapshotFromRunResult(answer, language, data), maxMarks);
  } catch {
    return { ...empty, status: "failed", feedback: "Your code couldn't be run at submit time, so this answer wasn't scored." };
  }
};

/** Grades every coding question, one run at a time (the runner is rate-limited and capped per process). */
export const gradeCodingAnswers = async ({
  questions,
  answers,
  lastRuns,
  language,
  maxMarks,
  runCode,
}: {
  questions: { idx: number; q: Question }[];
  answers: Record<number, string | undefined>;
  lastRuns: Record<number, CodeRunSnapshot | undefined>;
  language: string;
  maxMarks: number;
  runCode: RunCodeFn;
}): Promise<Record<number, CodingGrade>> => {
  const grades: Record<number, CodingGrade> = {};
  for (const { idx, q } of questions) {
    const run = lastRuns[idx];
    grades[idx] = await gradeCodingAnswer({
      question: q,
      answer: answers[idx],
      lastRun: run,
      language: run && run.code === answers[idx] ? run.language : language,
      maxMarks,
      runCode,
    });
  }
  return grades;
};
