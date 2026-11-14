// Copy shared by the landing page UI and its structured data (JSON-LD), so the
// answers search and answer engines read are exactly what visitors see.
// Only describe features that exist in the app today.

export const SITE_URL = "https://aarikaai.in";

export const SITE_SUMMARY =
  "Aarika.AI is an AI career co-pilot for India. It helps school and college students, job seekers and working professionals plan their career, practise mock interviews in text or live voice, build an ATS-ready resume, find matching jobs and internships, and prepare for competitive exams, all in one app.";

// Mirrors the exam list in src/app/exam-simulator/page.tsx.
export const EXAMS = [
  "UPSC Civil Services (Prelims GS & CSAT)",
  "IIT JEE",
  "NEET",
  "CAT",
  "SSC CGL",
  "Banking (IBPS / SBI PO)",
  "CA Foundation",
  "CBSE Class 10 & 12",
];

// Mirrors the plans in src/views/SubscriptionPage.tsx (prices in INR per month, GST extra).
export const PLANS = [
  {
    name: "Basic",
    price: 299,
    yearly: 249,
    desc: "Essential interview prep for career starters.",
    features: [
      "5 AI Mock Interviews per month",
      "Basic HR Interview Practice",
      "Resume Review",
      "Interview Readiness Score",
      "Limited Job Recommendations",
    ],
  },
  {
    name: "Professional",
    price: 699,
    yearly: 549,
    desc: "Comprehensive preparation for serious candidates.",
    popular: true,
    features: [
      "20 AI Mock Interviews per month",
      "HR + Technical Interview Preparation",
      "Real-Time Answer Scoring",
      "Company-Specific Preparation",
      "ATS Resume Optimization",
      "Skill Gap Analysis",
    ],
  },
  {
    name: "Elite",
    price: 1499,
    yearly: 1199,
    desc: "The ultimate strategy for top-tier roles.",
    comingSoon: true,
    features: [
      "Unlimited AI Mock Interviews",
      "Advanced Interview Simulation",
      "Domain-Specific Rounds",
      "Salary Negotiation Prep",
      "Career Switch Planning",
    ],
  },
] as const;

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Aarika.AI?",
    a: SITE_SUMMARY,
  },
  {
    q: "Is Aarika.AI free to use?",
    a: "Creating an account is free: sign up with email, Google or LinkedIn, no card needed. Paid plans add more mock interviews and deeper preparation: Basic is ₹299 per month and Professional is ₹699 per month (₹249 and ₹549 per month when billed yearly), with GST extra.",
  },
  {
    q: "How does the AI mock interview work?",
    a: "Pick an HR or technical round and answer the questions in text, or join a live voice interview where Aarika, the AI interviewer, talks to you in a video-call style room. After the interview every answer is scored and you get feedback on what to improve.",
  },
  {
    q: "Does the live interview record my camera?",
    a: "No. Your camera preview never leaves your device. During the call only your voice goes to the AI interviewer, and afterwards the transcript of your answers is used to score them and write your feedback.",
  },
  {
    q: "Can Aarika.AI help me apply for jobs?",
    a: "Yes. The Job Agent finds jobs that match your target role and skills. Smart Apply then prepares a resume tailored to that job, its ATS score, a cover letter and answers for the application form, so you can submit on the employer's site in minutes. Mission Hunt gives you a job feed matched to your profile, and freshers can browse internships and track applications.",
  },
  {
    q: "Which exams can I practise on the Exam Simulator?",
    a: `The Exam Simulator runs timed mock exams with negative marking, instant scores and an explanation for every question. JEE, NEET, UPSC (GS and CSAT), SSC CGL, IBPS PO, CAT and CA Foundation follow their official section and marking patterns; CBSE Class 10 and 12, or any other exam you type in, get an AI-built pattern. You can practise in English, Hindi or Hinglish.`,
  },
  {
    q: "Who is Aarika.AI for?",
    a: "School students, college students, job seekers, working professionals, career switchers and government exam aspirants. A 3 to 5 step onboarding asks where you are today, and the app then shows only the tools that fit your stage, from Career Discovery for school students to the Job Agent for job seekers.",
  },
  {
    q: "Can I talk to Aarika in Hindi?",
    a: "Yes. The AI career chat replies in the language you write in, including Hindi and Hinglish, and the Exam Simulator lets you pick English, Hindi or Hinglish for your questions.",
  },
  {
    q: "Who makes Aarika.AI?",
    a: "Aarika.AI is built in India by SenseforgeAI.",
  },
];
