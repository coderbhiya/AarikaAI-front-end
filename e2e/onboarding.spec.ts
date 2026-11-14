import { test, expect } from "@playwright/test";
import { closeShareModalIfShown, expectNoHorizontalScroll } from "./support/stack";

const run = Date.now().toString(36);

let phoneSeq = Math.floor(Math.random() * 900000);
const uniquePhone = () => `9${String(100000000 + (phoneSeq++ % 899999999)).slice(0, 9)}`;

async function register(page: import("@playwright/test").Page, name: string, email: string) {
  await page.goto("/register");
  await page.getByPlaceholder("John Doe").fill(name);
  await page.getByPlaceholder("name@example.com").fill(email);
  await page.getByPlaceholder("+91 00000 00000").fill(uniquePhone());
  const pw = page.getByPlaceholder("••••••••");
  await pw.nth(0).fill("LocalE2E#2026");
  await pw.nth(1).fill("LocalE2E#2026");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByText("What is your current status?")).toBeVisible({ timeout: 30_000 });
}

test("school student (Class 10): signup → onboarding → Hinglish welcome, no LinkedIn prompt @mobile", async ({ page }) => {
  await register(page, "Riya Pw", `pw-ui-school.${run}.${test.info().project.name}@e2e.test`);
  await page.getByRole("button", { name: "Student" }).click();
  await page.locator("#onboarding-next-btn").click();
  await page.getByRole("button", { name: /School \(Class 7/ }).click();
  await page.locator("#onboarding-next-btn").click();
  await page.getByRole("button", { name: /Class 10/ }).click();
  await page.locator("#onboarding-next-btn").click();
  await page.getByRole("button", { name: /CBSE/ }).click();
  await page.locator("#exam-prep-toggle").click();
  await expectNoHorizontalScroll(page);
  await page.getByRole("button", { name: /NEET UG/ }).click();
  await page.getByRole("button", { name: /Let's Go/ }).click();

  await expect(page.getByTestId("welcome-text")).toContainText(/stream|exams|career path/i);
  await expect(page.getByTestId("starter-prompt").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /share on linkedin/i })).toHaveCount(0);
});

test("working professional: new 'Your experience' step saves role/experience; welcome is persona-specific", async ({ page }) => {
  await register(page, "Vikram Pw", `pw-ui-pro.${run}@e2e.test`);
  await page.getByRole("button", { name: "Working Professional" }).click();
  await page.locator("#onboarding-next-btn").click();
  await expect(page.getByText("Tell us about your work")).toBeVisible();
  await expect(page.locator("#onboarding-next-btn")).toBeDisabled();
  await page.locator("#onb-current-role").fill("Software Engineer");
  await page.locator("#onb-experience").selectOption("4");
  await page.locator("#onb-target-role").fill("Senior Software Engineer");
  await page.locator("#onb-skills").fill("Java, Spring Boot, AWS");
  await page.locator("#onboarding-next-btn").click();
  await page.getByRole("button", { name: /Upskill/ }).click();
  await page.locator("#onboarding-next-btn").click();
  await page.getByRole("button", { name: /Let's Go/ }).click();
  await closeShareModalIfShown(page);
  await expect(page.getByTestId("welcome-text")).toContainText(/growth|upskilling|next move/i);
  await expect(page.getByTestId("starter-prompt")).toHaveCount(4);
});

test("signing up with a phone number that's already used shows a clear message", async ({ browser }) => {
  const phone = uniquePhone();
  for (const [i, expectOk] of [[1, true], [2, false]] as const) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/register");
    await page.getByPlaceholder("John Doe").fill("Dup Phone");
    await page.getByPlaceholder("name@example.com").fill(`pw-dup.${run}.${i}@e2e.test`);
    await page.getByPlaceholder("+91 00000 00000").fill(phone);
    const pw = page.getByPlaceholder("••••••••");
    await pw.nth(0).fill("LocalE2E#2026");
    await pw.nth(1).fill("LocalE2E#2026");
    await page.getByRole("button", { name: /create account/i }).click();
    if (expectOk) await expect(page.getByText("What is your current status?")).toBeVisible({ timeout: 30_000 });
    else await expect(page.getByText(/already linked to another account/i).first()).toBeVisible({ timeout: 30_000 });
    await ctx.close();
  }
});
