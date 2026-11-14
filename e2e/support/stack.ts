import { expect, type Page } from "@playwright/test";

// Local test stack only — refuse anything else.
export const API = process.env.E2E_API_URL || "http://localhost:3002";
export const AUTH_EMULATOR = process.env.E2E_AUTH_EMULATOR || "http://127.0.0.1:9099";
for (const u of [API, AUTH_EMULATOR, process.env.E2E_BASE_URL || "http://localhost:3003"]) {
  if (!["localhost", "127.0.0.1"].includes(new URL(u).hostname)) throw new Error(`E2E may only run against a local stack: ${u}`);
}

export const PASSWORD = process.env.E2E_USER_PASSWORD || "LocalE2E#2026";
const run = Date.now().toString(36);
let n = 0;

export type Persona = "school10" | "school12" | "college" | "professional" | "jobSeeker" | "switcher" | "govt";

export const ONBOARDING: Record<Persona, { name: string; body: Record<string, unknown> }> = {
  school10: { name: "Riya School", body: { currentStatus: "student", educationLevel: "school", schoolClass: "10", board: "CBSE", wantsExamPrep: true, targetExams: ["NEET UG"] } },
  school12: { name: "Aman School", body: { currentStatus: "student", educationLevel: "school", schoolClass: "12", board: "State", stream: "PCM", wantsExamPrep: true, targetExams: ["JEE Main"] } },
  college: { name: "Neha College", body: { currentStatus: "student", educationLevel: "college", primaryGoal: "get_job", communicationStyle: "english", degree: "B.Tech / B.E.", branch: "Computer Science", yearOfStudy: "3", graduationYear: "2028", targetRole: "Data Analyst", skills: ["Python", "SQL"] } },
  professional: { name: "Vikram Pro", body: { currentStatus: "professional", primaryGoal: "upskill", communicationStyle: "english", currentRole: "Software Engineer", experienceYears: "4", targetRole: "Senior Software Engineer", skills: ["Java", "AWS"] } },
  jobSeeker: { name: "Kiran Seeker", body: { currentStatus: "job_seeker", primaryGoal: "get_job", communicationStyle: "english", experienceYears: "0", targetRole: "Business Analyst", skills: ["Excel"] } },
  switcher: { name: "Sana Switcher", body: { currentStatus: "other", primaryGoal: "switch_career", communicationStyle: "english", currentRole: "School Teacher", experienceYears: "4", targetRole: "Product Manager" } },
  govt: { name: "Rahul Govt", body: { currentStatus: "govt_aspirant", primaryGoal: "exam_prep", govtTargetExams: ["SSC CGL"], govtCategory: "OBC", govtAge: "23", govtState: "Rajasthan", govtQualification: "Graduation", govtAttemptYear: "2027" } },
};

async function post(url: string, body: unknown, token?: string) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...(token && { authorization: `Bearer ${token}` }) }, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

/** Creates an emulator user + app account, optionally onboarded as `persona`. */
export async function createUser(persona: Persona, { onboard = true } = {}) {
  const email = `pw-${persona}.${run}.${++n}@e2e.test`;
  const su = await post(`${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=local-test`, { email, password: PASSWORD, returnSecureToken: true });
  if (!su.data.idToken) throw new Error(`emulator sign-up failed: ${JSON.stringify(su.data)}`);
  const vt = await post(`${API}/auth/verify-token`, { idToken: su.data.idToken, userData: { name: ONBOARDING[persona].name, email } });
  if (!vt.data.token) throw new Error(`verify-token failed: ${vt.status}`);
  if (onboard) {
    const ob = await post(`${API}/profile/onboarding`, ONBOARDING[persona].body, vt.data.token);
    if (ob.status !== 200) throw new Error(`onboarding failed: ${ob.status}`);
  }
  return { email, password: PASSWORD, token: vt.data.token as string };
}

/** Logs in through the real login page (Firebase emulator email/password). */
export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto("/");
  await page.getByPlaceholder("name@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/chat/, { timeout: 30_000 });
}

export async function closeShareModalIfShown(page: Page) {
  const skip = page.getByRole("button", { name: /skip for now/i });
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) await skip.click();
}

/** The sidebar is a drawer on phones; open it before checking links. */
export async function openSidebarIfMobile(page: Page) {
  const vw = page.viewportSize()?.width || 1366;
  if (vw < 768) {
    const menu = page.getByRole("button").filter({ has: page.locator("svg.lucide-menu") }).first();
    if (await menu.isVisible().catch(() => false)) await menu.click();
  }
}

export async function expectNoHorizontalScroll(page: Page) {
  const { scrollW, clientW } = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  expect(scrollW, "page should not scroll sideways").toBeLessThanOrEqual(clientW + 1);
}
