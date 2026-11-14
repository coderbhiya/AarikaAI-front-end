import { test, expect } from "@playwright/test";
import { createUser, login, closeShareModalIfShown, openSidebarIfMobile, type Persona } from "./support/stack";

// Which sidebar tools each persona should (and should not) see.
const NAV: Record<Persona, { show: string[]; hide: string[] }> = {
  school10: { show: ["nav-career-discovery", "nav-exam-calendar"], hide: ["nav-jobs", "nav-agent", "nav-resume-builder", "nav-internships", "nav-mock-interview", "nav-community"] },
  school12: { show: ["nav-career-discovery", "nav-exam-calendar", "nav-exam-simulator"], hide: ["nav-jobs", "nav-agent", "nav-mock-interview"] },
  college: { show: ["nav-internships", "nav-mock-interview", "nav-resume-builder", "nav-exam-simulator"], hide: ["nav-career-discovery", "nav-exam-calendar"] },
  professional: { show: ["nav-mock-interview", "nav-resume-builder"], hide: ["nav-career-discovery", "nav-exam-calendar", "nav-internships", "nav-exam-simulator"] },
  jobSeeker: { show: ["nav-internships", "nav-mock-interview"], hide: ["nav-career-discovery", "nav-exam-calendar"] },
  switcher: { show: ["nav-mock-interview"], hide: ["nav-career-discovery", "nav-exam-calendar", "nav-internships"] },
  govt: { show: ["nav-exam-calendar", "nav-exam-simulator"], hide: ["nav-jobs", "nav-agent", "nav-career-discovery", "nav-mock-interview", "nav-internships"] },
};

for (const [persona, nav] of Object.entries(NAV) as [Persona, (typeof NAV)[Persona]][]) {
  test(`${persona}: sidebar shows the right tools @mobile`, async ({ page }) => {
    const u = await createUser(persona);
    await login(page, u.email);
    await closeShareModalIfShown(page);
    await openSidebarIfMobile(page);
    for (const id of nav.show) await expect(page.getByTestId(id), `${id} should be visible`).toBeVisible();
    for (const id of nav.hide) await expect(page.getByTestId(id), `${id} should be hidden`).toHaveCount(0);
  });
}

test("school student opening job pages directly sees a friendly block, not job data", async ({ page }) => {
  const u = await createUser("school10");
  await login(page, u.email);
  for (const path of ["/jobs", "/agent", "/resume-builder", "/internships", "/mock-interview"]) {
    await page.goto(path);
    await expect(page.getByTestId("persona-blocked"), path).toBeVisible();
  }
});

test("new chat shows persona welcome and starter prompts (not a blank screen) @mobile", async ({ page }) => {
  const u = await createUser("govt");
  await login(page, u.email);
  await closeShareModalIfShown(page);
  await expect(page.getByTestId("welcome-text")).toContainText(/government exam/i);
  await expect(page.getByTestId("welcome-text")).toContainText("SSC CGL");
  await expect(page.getByTestId("welcome-text")).not.toContainText(/job match/i);
  await expect(page.getByTestId("starter-prompt")).toHaveCount(4);
});
