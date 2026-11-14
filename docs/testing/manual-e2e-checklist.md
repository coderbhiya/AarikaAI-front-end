# Manual E2E checklist per persona

Run this on the local test stack (`http://localhost:3003`), or on staging. Sign up with a new email for each persona. Payments are out of scope.

## 1. School student, Class 10 (also repeat for Class 12 with a stream)
- [ ] Sign-up toast says "Your account is ready" (it no longer says "professional profile").
- [ ] Onboarding: Student → School → Class → Board → exam goal. The toggle knob stays inside its track at phone width.
- [ ] No "Share on LinkedIn" popup after onboarding.
- [ ] Chat shows a Hinglish welcome, mentions the exam goal, has **no job alert**, and has 4 starter prompts.
- [ ] The sidebar has Career Discovery and Exams & Scholarships. It has no Mission Hunt, Job Agent, Resume Builder, Community, Internships or Mock Interview.
- [ ] Opening `/jobs`, `/agent`, `/resume-builder`, `/internships` or `/mock-interview` directly shows the "This section isn't part of your plan" card.
- [ ] Career Discovery: finish the 30 questions and get a stream recommendation, top 5 careers and an "Ask Aarika" link that opens chat with the question.
- [ ] Exams & Scholarships: exams show countdowns and eligibility badges, and the Scholarships tab loads.
- [ ] Ask chat a stream question: the answer cites no Reddit, Instagram or Facebook sources.

## 2. College student
- [ ] Onboarding asks for degree, year, branch, graduation year, college, target role and skills, then goal and tone.
- [ ] The sidebar has Internships, Mock Interview, Resume Builder, Placement Prep and Exam Simulator.
- [ ] Internships: matches show a match %, Save and Apply work, and My applications shows the stages with their history.
- [ ] Mission Hunt shows entry-level or relevant roles, not senior ones.

## 3. Working professional
- [ ] Onboarding "Your experience" step: Next stays disabled until a current role and experience are filled in.
- [ ] The welcome is growth-focused. A job alert appears only if it's a 60%+ match.
- [ ] No Internships link (more than 1 year of experience). Mock Interview is there.

## 4. Job seeker (fresher) and career switcher
- [ ] Job seeker: the role field is optional. A fresher sees Internships.
- [ ] Career switcher: the from/to fields are saved, and the welcome talks about the switch.

## 5. Govt exam aspirant
- [ ] No Mission Hunt, Job Agent or Placement Prep. Exam Simulator and Exams & Scholarships are there.
- [ ] The welcome mentions the target exam, for example SSC CGL, with no private job alert.
- [ ] The exam calendar includes the SSC exams.

## 6. Live mock interview (Chrome or Edge, with headphones)
1. Go to Mock Interview, then **Live interview: real HR or technical round**.
2. Pre-join:
   - The camera preview shows.
   - The mic bars move when you speak.
   - The page scrolls on a small screen.
3. Click **Join now** and don't press anything else:
   - [ ] Aarika greets you by name in an Indian-English style, and captions appear.
   - [ ] Answer by talking. She waits until you stop, then replies or asks a **follow-up about what you said**.
   - [ ] Talk while she is speaking: she stops (barge-in).
   - [ ] The phase chip changes (Introduction → About you → Core questions …).
4. Technical round only:
   - [ ] A code panel opens with a problem.
   - [ ] **Run tests** works for JavaScript.
   - [ ] She can discuss your code.
5. Leave with the red button, or let her end the call:
   - [ ] The report shows an overall score, strengths and improvements, and **How you spoke** (pace, fillers, pauses, talk ratio).
   - [ ] It also shows the per-answer scores, the coding result and the full transcript.
6. On a phone:
   - [ ] The tiles stack.
   - [ ] The controls and captions are reachable, with no sideways scroll.

## 7. Security checks (API)
- [ ] `POST /admin/register` without a super-admin token → 401.
- [ ] A normal user calling `/assessment/admin/review-queue` → 401/403.
- [ ] Signing up with a phone number that's already used shows "already linked to another account".
