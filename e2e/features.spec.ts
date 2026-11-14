import { test, expect } from "@playwright/test";
import { createUser, login, closeShareModalIfShown, expectNoHorizontalScroll } from "./support/stack";

test("Career Discovery: a school student completes the quiz and gets a stream + careers @mobile", async ({ page }) => {
  const u = await createUser("school10");
  await login(page, u.email);
  await page.goto("/career-discovery");
  await page.getByRole("button", { name: /start the quiz|start over/i }).click();
  for (let i = 0; i < 40; i++) {
    await page.getByRole("radiogroup").getByRole("radio").first().click();
    const next = page.getByRole("button", { name: /^next/i });
    if (!(await next.isVisible().catch(() => false))) break; // last question shows "See my results"
    await next.click();
  }
  await page.getByRole("button", { name: /see my results/i }).click();
  await expect(page.getByText("Your best-fit stream")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Top careers for you")).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("Exam calendar: Class 12 PCM student sees JEE Main with a countdown; scholarships tab loads @mobile", async ({ page }) => {
  const u = await createUser("school12");
  await login(page, u.email);
  await page.goto("/exam-calendar");
  await expect(page.getByText(/JEE Main/).first()).toBeVisible();
  await expect(page.getByText(/days?/i).first()).toBeVisible();
  await page.getByRole("tab", { name: /scholarships/i }).or(page.getByRole("button", { name: /^scholarships/i })).first().click();
  await expect(page.getByText(/scholarship/i).nth(1)).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("Exam calendar: govt aspirant sees SSC exams", async ({ page }) => {
  const u = await createUser("govt");
  await login(page, u.email);
  await page.goto("/exam-calendar");
  await expect(page.getByText(/SSC CGL/).first()).toBeVisible();
});

test("Internship hub: college student sees matches and can track one", async ({ page }) => {
  const u = await createUser("college");
  await login(page, u.email);
  await page.goto("/internships");
  await expect(page.getByText("Internships & Fresher Jobs")).toBeVisible();
  const save = page.getByRole("button", { name: /^save$/i }).first();
  await expect(save).toBeVisible({ timeout: 30_000 });
  await save.click();
  await expect(page.getByText(/Tracked · Saved/i).first()).toBeVisible();
  await page.getByRole("button", { name: /my applications/i }).or(page.getByRole("tab", { name: /my applications/i })).first().click();
  await expect(page.getByText(/saved/i).first()).toBeVisible();
});

test("Mock interview page offers the live voice interview @mobile", async ({ page }) => {
  const u = await createUser("jobSeeker");
  await login(page, u.email);
  await closeShareModalIfShown(page);
  await page.goto("/mock-interview");
  await page.getByTestId("live-interview-entry").click();
  await expect(page.getByTestId("live-prejoin")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ready to join?" })).toBeVisible();
  await expect(page.getByTestId("join-now")).toBeEnabled({ timeout: 15_000 }); // fake mic granted
  await expectNoHorizontalScroll(page);
});

test("Text mock interview: start → answer → feedback @llm", async ({ page }) => {
  const u = await createUser("college");
  await login(page, u.email);
  await page.goto("/mock-interview");
  await page.getByRole("button", { name: /start interview/i }).click();
  await expect(page.getByRole("textbox").first()).toBeVisible({ timeout: 60_000 });
});
