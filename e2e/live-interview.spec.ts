import { test, expect } from "@playwright/test";
import { createUser, login } from "./support/stack";

// Real voice session through AIML (fake mic/camera from Chromium). Costs a few cents; run with E2E_LIVE=1.
test("Live HR interview: join → interviewer speaks with captions → leave → report @live", async ({ page }) => {
  const u = await createUser("college");
  await login(page, u.email);
  await page.goto("/mock-interview/live");
  await page.getByLabel(/Role you're interviewing for/i).fill("Data Analyst");
  await expect(page.getByTestId("join-now")).toBeEnabled({ timeout: 15_000 });
  await page.getByTestId("join-now").click();

  await expect(page.getByTestId("live-call")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("interviewer-tile")).toBeVisible();
  // Mute the fake mic (a beep tone) so it doesn't interrupt the interviewer.
  await page.getByRole("button", { name: "Mute" }).click();
  // The interviewer opens the call on its own; its words show up as captions.
  await expect(page.getByTestId("captions")).toContainText(/Aarika/i, { timeout: 45_000 });
  await page.waitForTimeout(4000);

  await page.getByTestId("end-call").click();
  await expect(page.getByTestId("live-report")).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText(/Full transcript/)).toBeVisible();
});

test("Live technical interview layout: call UI fits a phone screen @live @mobile", async ({ page }) => {
  const u = await createUser("professional");
  await login(page, u.email);
  await page.goto("/mock-interview/live");
  await page.getByRole("button", { name: /Technical round/ }).click();
  await page.getByTestId("join-now").click();
  await expect(page.getByTestId("live-call")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Mute" }).click();
  await expect(page.getByTestId("end-call")).toBeInViewport();
  const { scrollW, clientW } = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  expect(scrollW).toBeLessThanOrEqual(clientW + 1);
  await page.getByTestId("end-call").click();
  await expect(page.getByTestId("live-report")).toBeVisible({ timeout: 90_000 });
});
