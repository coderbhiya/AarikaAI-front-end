# E2E tests (Playwright)

These tests run against the **local test stack only**. The helpers refuse any host other than localhost.

| Service | How to start | Port |
|---|---|---|
| Firebase Auth emulator | `.claude/launch.json` → `firebase-auth-emulator` | 9099 |
| Test backend (DB `aarikaai_jobtest`, rate limits off, live keys overridden) | `backend-localtest` | 3002 |
| Test frontend (talks to :3002 and the emulator) | `frontend-localtest` | 3003 |
| Mail catcher (optional) | `mailpit --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025` | 8025 |

Seed the test DB once, and again whenever the jobs expire. It refuses to run unless the DB name ends in `test`:

```bash
cd ../careerai_be
DB_HOST=localhost DB_PORT=5432 DB_NAME=aarikaai_jobtest DB_USER=$USER DB_PASSWORD= node src/scripts/seed-e2e.js
```

## Run

```bash
npm run test:e2e              # desktop + phone (Pixel 7) projects; skips @llm and @live
npm run test:e2e:llm          # also runs tests that call the LLM (slow)
npm run test:e2e:live         # real voice interview via AIML realtime (costs a few cents per run)
npx playwright show-report e2e-report
```

- **Fake camera and mic:** Chromium runs with fake devices, so the live-interview tests can join a real call. The fake mic plays a beep tone, so the tests mute it after joining.
- **`@mobile` tag:** tests with this tag also run on the phone project.

## Backend API tests

```bash
cd ../careerai_be
npm test           # unit tests
npm run test:api   # black-box API tests against :3002 (creates its own super_admin in the TEST DB only)
```
