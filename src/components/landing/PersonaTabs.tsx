"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { displaySerif } from "@/components/landing/fonts";
import { Shot, type Tone } from "@/components/landing/Shot";

// What each persona actually gets. Mirrors the persona route rules in
// src/components/auth/ProtectedRoute.tsx and the backend personaGuard
// (e.g. Mock Interview and Internships are not offered to school students).
// Screenshots in /public/landing are real app pages captured from a local test account.
const PERSONAS = [
  {
    id: "college",
    tone: "blue" as Tone,
    dot: "#3b6cf6",
    who: "college student",
    label: "College students",
    title: "Land your first internship and placement",
    desc: "Internships and fresher jobs ranked by how well they fit your branch and skills, plus interview and resume prep for campus season.",
    points: [
      "Internships & fresher jobs with a fit score, and an application tracker",
      "Mock HR and technical interviews with answer-by-answer feedback",
      "Campus placement prep for TCS, Infosys, Wipro, Accenture and more",
      "Resume Builder with an ATS keyword check",
    ],
    shot: "/landing/internships.webp",
    alt: "Aarika.AI Internships page listing internships ranked by match score for a computer science student",
    caption: "Internships, ranked by how well they fit your profile",
  },
  {
    id: "jobseeker",
    tone: "green" as Tone,
    dot: "#2fa77a",
    who: "job seeker",
    label: "Job seekers",
    title: "Let your job agent do the searching",
    desc: "The Job Agent scans company career pages for roles that match your target role and skills, then gets each application ready for you.",
    points: [
      "Daily job matches with the reason each one fits you",
      "Smart Apply: tailored resume, ATS score, cover letter and form answers",
      "Mission Hunt feed that hides jobs that don't fit",
      "Live voice mock interviews before the real one",
    ],
    shot: "/landing/job-agent.webp",
    alt: "Aarika.AI Job Agent dashboard showing matching jobs with match percentages and Smart Apply buttons",
    caption: "Job Agent: matched jobs with Smart Apply",
  },
  {
    id: "professional",
    tone: "sky" as Tone,
    dot: "#0ea5e9",
    who: "professional",
    label: "Professionals & switchers",
    title: "Move up, or move across, with a plan",
    desc: "For working professionals aiming higher and people changing careers: see the gap, follow a roadmap and practise for the interview.",
    points: [
      "Skill gap & SWOT analysis against your target role",
      "Step-by-step career roadmap with milestones",
      "Mission Hunt jobs matched to the role you want next",
      "Senior-level HR, technical and behavioral mock interviews",
    ],
    shot: "/landing/mission-hunt.webp",
    alt: "Aarika.AI Mission Hunt job feed with roles matched to the user's target role and a job detail panel",
    caption: "Mission Hunt: only roles that match where you're heading",
  },
  {
    id: "school",
    tone: "violet" as Tone,
    dot: "#8b5cf6",
    who: "school student",
    label: "School students",
    title: "Choose your stream with confidence",
    desc: "For Class 9 to 12: find the stream and careers that suit you, practise for board and entrance exams, and never miss a scholarship.",
    points: [
      "Career Discovery quiz: best-fit stream (PCM, PCB, Commerce, Arts) and careers",
      "Exam Simulator for JEE, NEET and CBSE Class 10 & 12",
      "Exams & Scholarships calendar filtered to what you're eligible for",
      "Ask Aarika any doubt, in English, Hindi or Hinglish",
    ],
    shot: "/landing/career-discovery.webp",
    alt: "Aarika.AI Career Discovery quiz intro: 30 quick questions to find your best-fit stream and careers",
    caption: "Career Discovery: 30 questions, about 10 minutes",
  },
  {
    id: "govt",
    tone: "amber" as Tone,
    dot: "#e8913a",
    who: "govt exam aspirant",
    label: "Govt exam aspirants",
    title: "Prepare like it's exam day",
    desc: "Timed mocks on official patterns with negative marking, and one calendar that tells you which exams you're eligible for.",
    points: [
      "UPSC, SSC CGL and IBPS PO mocks on official section and marking patterns",
      "Instant score with an explanation for every question",
      "Practise in English, Hindi or Hinglish",
      "Exam calendar with eligibility checked against your age, category and qualification",
    ],
    shot: "/landing/exam-calendar.webp",
    alt: "Aarika.AI Exams and Scholarships calendar showing NDA and SSC CGL dates with eligibility based on the user's profile",
    caption: "Exams calendar with eligibility from your profile",
  },
];

export default function PersonaTabs() {
  const [active, setActive] = useState(PERSONAS[0].id);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Choose who you are"
        className="-mx-5 flex gap-7 overflow-x-auto border-b border-black/[0.1] px-5 [scrollbar-width:none] sm:mx-0 sm:gap-9 sm:px-0"
      >
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={active === p.id}
            aria-controls={`panel-${p.id}`}
            onClick={() => setActive(p.id)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-4 text-[15px] transition-colors ${
              active === p.id ? "border-[#2f5fe8] font-medium text-[#141413]" : "border-transparent text-[#77756e] hover:text-[#141413]"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: p.dot }} aria-hidden />
            {p.label}
          </button>
        ))}
      </div>

      {/* Every panel is in the HTML so search engines read all of them; only the active one is shown. */}
      {PERSONAS.map((p) => (
        <div
          key={p.id}
          role="tabpanel"
          id={`panel-${p.id}`}
          aria-labelledby={`tab-${p.id}`}
          hidden={active !== p.id}
          className={`mt-12 items-center gap-10 lg:grid-cols-12 lg:gap-16 ${active === p.id ? "grid" : "hidden"}`}
        >
          <div className="lg:col-span-5">
            <h3 className={`${displaySerif.className} text-[32px] leading-[1.1] tracking-[-0.01em] sm:text-[40px]`}>{p.title}</h3>
            <p className="mt-4 text-[16px] leading-relaxed text-[#5f5e5a]">{p.desc}</p>
            <ul className="mt-7 border-t border-black/[0.1]">
              {p.points.map((pt) => (
                <li key={pt} className="border-b border-black/[0.1] py-3.5 text-[15px] text-[#3d3c39]">
                  {pt}
                </li>
              ))}
            </ul>
            <Link href="/register" className="group mt-8 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#141413]">
              <span className="border-b border-black/30 pb-0.5 transition-colors group-hover:border-black">Start free as a {p.who}</span>
              <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
          <figure className="min-w-0 lg:col-span-7">
            <Shot src={p.shot} alt={p.alt} w={1400} h={1050} tone={p.tone} eager />
            <figcaption className="mt-4 text-center text-[13px] text-[#77756e]">{p.caption}</figcaption>
          </figure>
        </div>
      ))}
    </div>
  );
}
