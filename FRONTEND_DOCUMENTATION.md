# AarikaAI Frontend Codebase Documentation

Is document me **AarikaAI Frontend (`AarikaAI-front-end`)** ke saare folders, files aur unke kaam (responsibility) ki detailed breakdown di gayi hai.

---

## 🛠 Tech Stack & Architecture Overview

* **Framework:** Next.js 15 (App Router) + React 18
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Radix UI / Shadcn UI + Framer Motion
* **Authentication & State:** Firebase Auth + Custom JWT Context (`AuthContext`)
* **API Client:** Axios (`@/lib/axios`) with Bearer Token Interceptors
* **Visualization & Exports:** Recharts (Charts), Mermaid (Diagrams), React Markdown, jsPDF / html2canvas (Resume Export)

---

## 📁 Directory Structure & File Breakdown

```
AarikaAI-front-end/
├── package.json               # Project metadata, dependencies, build/dev scripts
├── next.config.mjs            # Next.js configuration (redirects, headers, images)
├── tailwind.config.ts         # Tailwind CSS theme customization & animations
├── tsconfig.json              # TypeScript configuration & path aliases (@/* -> ./src/*)
├── postcss.config.js          # PostCSS configuration for Tailwind CSS
├── middleware.ts              # Next.js route guard middleware (token cookie check)
└── src/
    ├── app/                   # Next.js App Router Page Routes
    ├── views/                 # Full Page View Components
    ├── components/            # Reusable React UI Components
    ├── contexts/              # Global React Contexts (Auth State, Profile)
    ├── services/              # API Communication & Backend Services
    ├── lib/                   # Core Configurations (Firebase, Axios, Utilities)
    ├── hooks/                 # Custom React Hooks
    ├── types/                 # TypeScript Interfaces & Models
    └── utils/                 # Helper Utilities (Resume Parsing, Push Notifications)
```

---

## 1. ⚙️ Root Configuration Files

* **[`package.json`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/package.json):** Project ki sabhi external libraries (Next.js, Radix UI, Firebase, Axios, Tailwind) aur scripts (`npm run dev`, `build`) ko define karta hai.
* **[`next.config.mjs`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/next.config.mjs):** Next.js ka global configuration rules setup karta hai.
* **[`tailwind.config.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/tailwind.config.ts):** Design system, custom color variables, fonts aur animations settings.
* **[`tsconfig.json`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/tsconfig.json):** TypeScript compilation options aur path aliases `@/*` to `./src/*` setup karta hai.
* **[`src/middleware.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/middleware.ts):** Har incoming HTTP request par run hota hai; cookies se `authToken` check karke protected pages (`/chat`, `/jobs`, `/profile`, `/admin`) par unauthorized access rokta hai aur login screen par redirect karta hai.

---

## 2. 🌐 Routes (`src/app/`)

Next.js App Router ke endpoints:

* **[`src/app/layout.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/layout.tsx):** Entire app ka root HTML wrapper jo `AuthProvider` aur global UI providers load karta hai.
* **[`src/app/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/page.tsx):** Home / Landing Page route (`/`), jo default Auth screen rendar karta hai.
* **[`src/app/globals.css`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/globals.css):** Application-wide global CSS styling aur theme variables (Dark/Light mode).
* **[`src/app/chat/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/chat/page.tsx):** AI Chat Workspace route (`/chat`), protected by auth.
* **[`src/app/jobs/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/jobs/page.tsx):** Jobs portal & Auto-Apply agent page route (`/jobs`).
* **[`src/app/profile/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/profile/page.tsx):** User Profile management page route (`/profile`).
* **[`src/app/admin/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/admin/page.tsx):** Platform Admin panel route (`/admin`).
* **[`src/app/agent/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/agent/page.tsx):** AI Agent automation status dashboard route (`/agent`).
* **[`src/app/learning/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/learning/page.tsx):** Learning courses & AI practice workspace route (`/learning`).
* **[`src/app/journey/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/journey/page.tsx):** Career Journey & roadmap timeline page route (`/journey`).
* **[`src/app/skill-score/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/skill-score/page.tsx):** Skill Score evaluation page route (`/skill-score`).
* **[`src/app/subscription/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/subscription/page.tsx):** Subscription plans and pricing page route (`/subscription`).
* **[`src/app/community/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/community/page.tsx):** Community discussions & channels page route (`/community`).
* **[`src/app/notifications/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/notifications/page.tsx):** Real-time notifications page route (`/notifications`).
* **[`src/app/open-jobs/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/open-jobs/page.tsx):** Public open jobs directory route (`/open-jobs`).
* **[`src/app/about/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/about/page.tsx):** About AarikaAI page (`/about`).
* **[`src/app/privacy/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/privacy/page.tsx):** Privacy Policy document page (`/privacy`).
* **[`src/app/terms/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/terms/page.tsx):** Terms and Conditions document page (`/terms`).
* **[`src/app/api-docs/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/api-docs/page.tsx):** Developer API documentation page (`/api-docs`).
* **[`src/app/updates-faq/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/updates-faq/page.tsx):** FAQ & Product updates page (`/updates-faq`).
* **[`src/app/reviews/page.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/app/reviews/page.tsx):** User Testimonials & Reviews page (`/reviews`).

---

## 3. 🖥️ Screen Views (`src/views/`)

Screen views actual business logic aur full-page UI components hold karte hain:

* **[`src/views/Jobs.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/Jobs.tsx):** Main Job portal view — Job search, filters, AI resume matching percentage, auto-apply agent trigger.
* **[`src/views/AdminPanel.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/AdminPanel.tsx):** Admin control panel — User management, credit allocation, system diagnostics, analytics charts.
* **[`src/views/ProfilePage.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/ProfilePage.tsx):** Complete User Profile page wrapper jo modular tabs (Personal, Experience, Education, Skills, Projects, Certifications, Hobbies, Achievements, Assessment Reports) render karta hai.
* **[`src/views/AgentDashboard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/AgentDashboard.tsx):** Background AI Agent activity monitor (auto-application progress, match confidence).
* **[`src/views/SubscriptionPage.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/SubscriptionPage.tsx):** Pricing plans, feature comparison, upgrade triggers, and credit purchase screens.
* **[`src/views/MyLearning.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/MyLearning.tsx):** Learning workspace — interactive courses, study guides, AI tutor chat, exam simulators.
* **[`src/views/SkillScore.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/SkillScore.tsx):** AI Skill Score analysis & Radar/Bar charts visualization.
* **[`src/views/JourneyPage.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/JourneyPage.tsx):** Visual step-by-step career milestone roadmap.
* **[`src/views/Notification.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/Notification.tsx):** Full notifications list with filtering and mark-as-read options.
* **[`src/views/CommunityView.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/CommunityView.tsx):** Group channel chat interface for user interaction.
* **[`src/views/JobDetail.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/JobDetail.tsx):** Specific job vacancy breakdown with requirements & apply options.
* **[`src/views/OpportunityReport.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/OpportunityReport.tsx):** AI generated career opportunity report.
* **[`src/views/About.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/About.tsx):** Company story, vision, and team details.
* **[`src/views/ApiDocs.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/ApiDocs.tsx):** Interactive API documentation UI.
* **[`src/views/ArchitectureGuide.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/ArchitectureGuide.tsx):** Platform design architecture explanation view.
* **[`src/views/MarketingPanel.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/MarketingPanel.tsx):** Promotional and marketing campaigns view.
* **[`src/views/OpenJobs.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/OpenJobs.tsx):** Open job listings for non-authenticated or public browsing.
* **[`src/views/Privacy.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/Privacy.tsx):** Legal privacy policy text.
* **[`src/views/Reviews.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/Reviews.tsx):** User feedback and rating showcase page.
* **[`src/views/Termandconditions.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/Termandconditions.tsx):** Legal terms & conditions text.
* **[`src/views/UpdatesFaq.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/views/UpdatesFaq.tsx):** Frequently asked questions and product release notes.

---

## 4. 🧩 Core Components (`src/components/`)

* **[`src/components/Sidebar.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/Sidebar.tsx):** Main Navigation Sidebar (links to Chat, Jobs, Learning, Profile, Admin, Logout).
* **[`src/components/ChatArea.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/ChatArea.tsx):** Primary AI Chat interface — handles stream responses, message history, file attachments, and rendering dynamic AI response cards.
* **[`src/components/ChatInput.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/ChatInput.tsx):** User input box with prompt suggestions, voice typing, and file upload triggers.
* **[`src/components/LeaderboardTab.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/LeaderboardTab.tsx):** User rankings, gamification points, and badge rewards table.
* **[`src/components/BrainLogo.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/BrainLogo.tsx):** Animated AI brain brand logo SVG component.

### 🔐 Auth Components (`src/components/auth/`)
* **[`LoginPage.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/LoginPage.tsx):** User login form (Firebase Google login & Email/Password authentication).
* **[`RegisterPage.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/RegisterPage.tsx):** Account registration form with input validations.
* **[`ProtectedRoute.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/ProtectedRoute.tsx):** HOC / Guard component jo wrap kiye gaye routes ke liye check karta hai ki user logged in aur phone verified hai ya nahi.
* **[`OnboardingFlow.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/OnboardingFlow.tsx):** Multi-step setup wizard (target role, experience level, skill inputs).
* **[`PhoneVerification.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/PhoneVerification.tsx):** Phone number entry & OTP trigger interface.
* **[`OTPVerification.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/OTPVerification.tsx):** OTP digit input box for phone verification.
* **[`ForgotPasswordPage.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/ForgotPasswordPage.tsx):** Reset password email dispatch form.
* **[`LinkedInShareModal.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/auth/LinkedInShareModal.tsx):** Achievement / Resume sharing to LinkedIn modal.

### 💬 Chat Components (`src/components/chat/`)
* **[`MessageItem.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/MessageItem.tsx):** Individual chat bubble component — renders markdown, syntax highlighted code, copy/pin actions, and rich cards.
* **[`MessageList.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/MessageList.tsx):** Scrollable container for message thread.
* **[`CitationInspectorModal.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/CitationInspectorModal.tsx):** Shows backend sources & web reference links cited by AI.
* **[`PinnedNotesDrawer.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/PinnedNotesDrawer.tsx):** Saved notes & bookmarked AI insights drawer.
* **[`SuggestionChips.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/SuggestionChips.tsx):** Recommended follow-up query chips.

### 🎴 Chat Interactive Cards (`src/components/chat/cards/`)
Chat messages me dynamic JSON responses ke roop me rendar hone wale rich cards:
* **[`GeneratedResumeCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/GeneratedResumeCard.tsx):** AI generated resume preview, live inline editing, template toggle, and PDF download.
* **[`FullExamSimulator.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/FullExamSimulator.tsx):** Full-screen interactive mock test environment with countdown timer, question navigation, scoring system, and AI explanation.
* **[`ResumeAnalysisCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/ResumeAnalysisCard.tsx):** Resume ATS score, missing keywords, and improvement suggestions card.
* **[`SkillGapCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/SkillGapCard.tsx):** Visual breakdown of user's current skills vs target job requirements.
* **[`DiagramCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/DiagramCard.tsx):** Renders dynamic Mermaid flowcharts & architecture diagrams.
* **[`RoadmapCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/RoadmapCard.tsx):** Interactive learning roadmap overview card.
* **[`SWOTCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/SWOTCard.tsx):** Personal SWOT Analysis matrix card.
* **[`JobCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/JobCard.tsx):** Inline job opportunity card with quick apply button.
* **[`CompanyTestCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/CompanyTestCard.tsx):** Company specific interview prep test card.
* **[`CourseCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/CourseCard.tsx):** Recommended learning course card.
* **[`StudyGuideCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/StudyGuideCard.tsx):** Structured topic study guide card.
* **[`QuizCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/QuizCard.tsx):** Quick 1-question interactive quiz card.
* **[`BriefingCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/BriefingCard.tsx):** Daily career briefing & news card.
* **[`BadgeCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/BadgeCard.tsx):** Unlocked achievement badge card.
* **[`PdfDownloadCard.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/chat/cards/PdfDownloadCard.tsx):** PDF report download card.

### 👤 Profile Tab Components (`src/components/profile/`)
* **[`PersonalInfo.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/PersonalInfo.tsx):** Name, Email, Bio, Phone number, and Social links form.
* **[`Experience.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/Experience.tsx):** Work experience list & editor.
* **[`Education.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/Education.tsx):** Academic qualifications list & editor.
* **[`Skills.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/Skills.tsx):** Technical & Soft skills editor with ratings.
* **[`Projects.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/Projects.tsx):** Portfolio projects editor.
* **[`Certifications.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/Certifications.tsx):** Professional certificates list & editor.
* **[`Achievements.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/Achievements.tsx):** Badges and unlocked milestones.
* **[`AssessmentReportsTab.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/AssessmentReportsTab.tsx):** History of test scores & skill assessment reports.
* **[`ProfileSyncModal.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/profile/ProfileSyncModal.tsx):** Modal for auto-filling profile from LinkedIn or uploaded resume PDF.

### 📄 Resume Templates (`src/components/resume/templates/`)
* **[`TemplateClassic.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/resume/templates/TemplateClassic.tsx):** Clean 1-column ATS-friendly traditional resume template layout.
* **[`TemplateModern.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/components/resume/templates/TemplateModern.tsx):** Modern 2-column sidebar design resume template layout.

---

## 5. ⚡ Services & API Layer (`src/services/`)

Backend APIs se communication karne wali classes/functions:

* **[`chatService.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/chatService.ts):** AI Chat message send/receive streaming endpoints, pinning notes, saving cards.
* **[`profileService.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/profileService.ts):** User Profile CRUD, resume PDF parsing, LinkedIn import API calls.
* **[`adminService.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/adminService.ts):** Admin dashboard API calls (list users, fetch analytics, update user credits).
* **[`agentApi.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/agentApi.ts):** Auto-apply agent execution triggers & job application tracking endpoints.
* **[`conversationService.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/conversationService.ts):** Chat threads list, create new chat session, delete chat thread.
* **[`gamificationService.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/gamificationService.ts):** User points, badges, daily login streak API calls.
* **[`paymentService.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/paymentService.ts):** Subscription plan purchase & payment gateway (Razorpay/Stripe) checkout integration.
* **[`services/assessment/`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/services/assessment):**
  * `QuestionGenerationEngine.ts`: Target job role ke basis par dynamic exam questions generate karta hai.
  * `AssessmentRuntimeAdapter.ts`: Exam runtime execution, timer, answer grading aur result evaluation handle karta hai.
  * `AssessmentGenerationQueue.ts`: Question generation background queue manage karta hai.

---

## 6. 🔐 Auth & State (`src/contexts/` & `src/lib/`)

* **[`src/contexts/AuthContext.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/contexts/AuthContext.tsx):** App ka heart! User authentication state (`user`), auth tokens (`localStorage` & `authToken` cookie), automatic background profile syncing (`syncProfile`), login/logout methods, aur sidebar state maintain karta hai.
* **[`src/lib/auth.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/lib/auth.ts):** Firebase App & Authentication initialize karta hai.
* **[`src/lib/axios.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/lib/axios.ts):** Base URL setup wala Axios instance, jo har request me `Bearer <authToken>` header automatically attach karta hai.
* **[`src/lib/utils.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/lib/utils.ts):** `cn()` utility function (Tailwind classes merge karne ke liye).

---

## 7. 🛠 Hooks, Types & Utilities (`src/hooks/`, `src/types/`, `src/utils/`)

* **[`src/hooks/use-mobile.tsx`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/hooks/use-mobile.tsx):** Mobile viewport screen size detect karne ke liye hook.
* **[`src/hooks/use-toast.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/hooks/use-toast.ts):** Toast alert notifications trigger karne ka hook.
* **[`src/types/index.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/types/index.ts):** Entire application ke TypeScript Interfaces (`User`, `Job`, `ChatMessage`, `Badge`, `Course`, `Quiz`, `AssessmentReport`).
* **[`src/utils/resumeDetector.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/utils/resumeDetector.ts):** Uploaded PDF/Word resume files se structured text & metadata extract karne wala helper.
* **[`src/utils/pushNotifications.ts`](file:///Users/aakashdave/Developer/AarikaAI/Code/AarikaAI-front-end/src/utils/pushNotifications.ts):** Web Push notifications service worker registration and permission handler.

---
