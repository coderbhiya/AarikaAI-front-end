import { test, expect, type Page } from "@playwright/test";
import { createUser, login } from "./support/stack";

// A fixed company paper (served in place of POST /company-assessment/start) so
// the test doesn't depend on what the LLM generates. Run Code and submit hit
// the real local backend: the code really runs in the sandbox.
const PAPER = {
  testName: "Amazon SDE OA",
  companyName: "Amazon",
  sections: [
    {
      name: "Code Debugging & Logical Flaws",
      type: "mcq",
      questions: [
        {
          id: 2000,
          question: "Which keyword declares a block-scoped constant in JavaScript?",
          options: ["var", "let", "const", "static"],
          correctAnswer: "const",
          explanation: "`const` is block-scoped and can't be reassigned.",
        },
      ],
    },
    {
      name: "Hands-on Coding (DSA)",
      type: "coding",
      questions: [
        {
          id: 101,
          title: "Second Largest Distinct Number",
          problemStatement: "Given an array as JSON, return the second largest **distinct** value, or `-1`.",
          constraints: "0 <= N <= 10^5",
          sampleTestCases: [
            { input: "[3, 1, 4, 1, 5]", output: "4" },
            { input: "[7, 7, 7]", output: "-1" },
            { input: "[2, 9, 9, 4]", output: "4" },
          ],
          hiddenTestToken: null,
          hiddenTestCount: 0,
          testCasesVerified: true,
        },
        {
          id: 102,
          title: "Balanced Brackets",
          problemStatement: "Given a string of `()[]{}`, return `true` if it is balanced, otherwise `false`.",
          constraints: "0 <= |s| <= 10^5",
          sampleTestCases: [
            { input: "([]{})", output: "true" },
            { input: "([)]", output: "false" },
            { input: "((", output: "false" },
          ],
          hiddenTestToken: null,
          hiddenTestCount: 0,
          testCasesVerified: true,
        },
      ],
    },
    {
      name: "Work Simulation & Leadership Principles",
      type: "behavioral",
      questions: [{ id: 901, scenario: "Tell me about a time you faced a tight deadline.", targetCompetency: "Ownership" }],
    },
  ],
};

const SECOND_LARGEST_OK = `function solution(input) {
  const s = [...new Set(JSON.parse(input))].sort((a, b) => b - a);
  return s.length < 2 ? -1 : s[1];
}`;
// Passes only the first example: 1 of 3.
const BRACKETS_WRONG = `function solution(input) {
  return String(input).length % 2 === 0;
}`;

// The simulator renders a desktop and a mobile layout; only one is visible.
const shown = (page: Page, text: string | RegExp) =>
  page.getByText(text, typeof text === "string" ? { exact: false } : undefined).and(page.locator(":visible")).first();

const visibleButton = (page: Page, text: string) =>
  page.locator("button:visible").filter({ has: page.getByText(text, { exact: true }) });

test("Exam simulator: one paper per session, MCQs stay MCQs, coding answers are scored from their test cases", async ({ page }) => {
  let startCalls = 0;
  await page.route("**/company-assessment/start", (route) => {
    startCalls++;
    return route.fulfill({ json: { success: true, data: PAPER } });
  });
  await page.route("**/assessment/blueprint**", (route) =>
    route.fulfill({
      json: { success: true, blueprint: { durationMinutes: 30, markingScheme: { correct: 2, incorrect: 0 }, sections: [{ name: "General", questionCount: 4 }] } },
    })
  );
  await page.route("**/assessment/evaluate-descriptive", (route) =>
    route.fulfill({ json: { success: true, data: { marksAwarded: 3, maxMarks: 5, feedback: "Clear STAR structure." } } })
  );

  const u = await createUser("college");
  await login(page, u.email);
  await page.goto("/exam-simulator");
  await page.locator("select").first().selectOption("__custom__");
  await page.getByPlaceholder(/GATE Computer Science/).fill("Amazon SDE OA");
  await page.getByRole("button", { name: /Generate & Start Exam/ }).click();

  const editor = page.getByPlaceholder("// Write your solution function here...");
  const saveNext = page.locator("button:visible", { hasText: "Save & Next" });

  // Q1: an MCQ in an "OA" exam renders as an MCQ, not in the code editor.
  await expect(shown(page, "Which keyword declares a block-scoped constant")).toBeVisible({ timeout: 60_000 });
  await expect(editor).toHaveCount(0);
  await visibleButton(page, "const").click();
  await saveNext.click();

  // Q2: correct code, run once (the run result is reused at submit).
  await expect(shown(page, "Examples:")).toBeVisible();
  await editor.fill(SECOND_LARGEST_OK);
  await page.getByRole("button", { name: /Run Code Sandbox/ }).click();
  await expect(shown(page, "Passed 3/3 Test Cases (100%)")).toBeVisible({ timeout: 30_000 });
  await saveNext.click();

  // Q3: wrong code, never run (it's run at submit).
  await expect(shown(page, /if it is balanced/)).toBeVisible();
  await editor.fill(BRACKETS_WRONG);
  await saveNext.click();

  // Q4: behavioral prompt → written answer.
  await expect(shown(page, "Tell me about a time you faced a tight deadline.")).toBeVisible();
  await page.locator('textarea[placeholder^="Type your answer here"]:visible').fill("Situation: release day. Task: fix a bug. Action: I triaged and shipped a fix. Result: on time.");

  const submitReq = page.waitForRequest((r) => r.url().includes("/company-assessment/submit") && r.method() === "POST", { timeout: 60_000 });
  await saveNext.click(); // last question → submit

  const body = (await submitReq).postDataJSON();
  expect(startCalls).toBe(1);

  // 2 (MCQ) + 2 (coding, 3/3) + 0.67 (coding, 1/3) + 3 (written) of 2 + 2 + 2 + 5.
  expect(body.totalMarks).toBe(11);
  expect(body.scoreObtained).toBeCloseTo(7.67, 2);
  expect(body.codingResults).toHaveLength(2);
  expect(body.codingResults[0]).toMatchObject({ questionIndex: 1, status: "graded", passedCount: 3, totalTestCases: 3, allPassed: true, marksAwarded: 2 });
  expect(body.codingResults[1]).toMatchObject({ questionIndex: 2, status: "graded", passedCount: 1, totalTestCases: 3, allPassed: false, marksAwarded: 0.67 });
  expect(body.answers.map((a: { isCorrect: boolean }) => a.isCorrect)).toEqual([true, true, false, true]);

  // The report shows the same score (7.67 / 11 → 70%) and the coding marks,
  // and still has every question after the attempt is saved.
  await expect(page.locator("body")).toContainText("Score: 70%");
  await page.getByRole("button", { name: /View Answer Key & Solutions/ }).click();
  await expect(shown(page, "Q1. Which keyword declares a block-scoped constant")).toBeVisible();
  await expect(shown(page, "2/2 MARKS")).toBeVisible();
  await expect(shown(page, "0.67/2 MARKS")).toBeVisible();
  await expect(shown(page, "Passed 1/3 test cases.")).toBeVisible();
});
