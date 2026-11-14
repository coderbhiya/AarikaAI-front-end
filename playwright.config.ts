import { defineConfig, devices } from "@playwright/test";

// E2E tests run against the LOCAL test stack only (see e2e/README.md):
//   frontend-localtest :3003 → backend-localtest :3002 (DB aarikaai_jobtest) + Firebase Auth emulator :9099.
// Tags: @llm (real model calls, slow) and @live (real voice session, costs a few cents) are
// skipped unless E2E_LLM=1 / E2E_LIVE=1. @mobile tests also run on a phone-sized project.
const skip: string[] = [];
if (!process.env.E2E_LLM) skip.push("@llm");
if (!process.env.E2E_LIVE) skip.push("@live");
const grepInvert = skip.length ? new RegExp(skip.join("|")) : undefined;

const fakeMedia = ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"];

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3003",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    permissions: ["microphone", "camera"],
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 }, launchOptions: { args: fakeMedia } },
      grepInvert,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], launchOptions: { args: fakeMedia } },
      grep: /@mobile/,
      grepInvert,
    },
  ],
});
