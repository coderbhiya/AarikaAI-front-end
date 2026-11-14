import { Globe, Mail, Phone } from "lucide-react";
import { PublicPage, SectionLabel, serif } from "@/components/landing/Site";
import { EXAMS, MORE, PERSONAS, SITE_SUMMARY } from "@/components/landing/content";

// About page. Same rule as the landing page: only describe what exists in the app today,
// no invented stats, rankings or security claims.

const CORE = [
  { name: "Mock Interview", desc: "HR, technical and behavioral rounds in text, or a live voice interview. Every answer is scored, with a stronger sample answer.", dot: "bg-[#8b5cf6]" },
  { name: "Job Agent & Smart Apply", desc: "Finds roles that fit your target role and skills, then prepares a tailored resume, cover letter and form answers.", dot: "bg-[#2fa77a]" },
  { name: "Exam Simulator", desc: "Timed papers with negative marking and an explanation for every question, in English, Hindi or Hinglish.", dot: "bg-[#e8913a]" },
];

const DOTS = ["bg-[#3b6cf6]", "bg-[#e0607e]", "bg-[#e8913a]", "bg-[#2fa77a]", "bg-[#8b5cf6]", "bg-[#0ea5e9]", "bg-[#3b6cf6]", "bg-[#2fa77a]"];

const APPROACH = [
  { title: "Only real features", body: "Everything on this page is in the app today. No made-up numbers, rankings or testimonials." },
  { title: "Private by design", body: "In live interviews your camera stays on your device; only your voice reaches the AI interviewer." },
  { title: "Made for India", body: "Built by SenseforgeAI for Indian exams, campuses and job markets. Pay in rupees via Razorpay." },
];

const CONTACT = [
  { icon: Mail, label: "Email", value: "dave@senseforge.in", href: "mailto:dave@senseforge.in" },
  { icon: Phone, label: "Phone", value: "+91 91746 99025", href: "tel:+919174699025" },
  { icon: Globe, label: "Company website", value: "senseforge.in", href: "https://senseforge.in", external: true },
];

export default function About() {
  return (
    <PublicPage>
      {/* Hero */}
      <section aria-labelledby="about-title" className="mx-auto max-w-[1200px] px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:pt-20">
        <div className="mx-auto max-w-4xl text-center lg:relative lg:isolate">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 hidden h-[620px] w-[1400px] -translate-x-1/2 lg:block" aria-hidden>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,20,19,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,19,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_40%,black,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(35%_40%_at_32%_35%,rgba(59,108,246,0.12),transparent),radial-gradient(30%_38%_at_70%_40%,rgba(139,92,246,0.11),transparent)]" />
          </div>
          <SectionLabel>About Aarika.AI</SectionLabel>
          <h1 id="about-title" className={`${serif} mt-5 text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[64px] lg:text-[76px]`}>
            One co-pilot for every step of your{" "}
            <em className="bg-gradient-to-r from-[#2f5fe8] to-[#7c4dff] bg-clip-text pr-2 italic text-transparent">career.</em>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-[#5f5e5a] sm:text-[19px]">{SITE_SUMMARY}</p>
          <p className="mt-5 text-[14px] text-[#77756e]">
            Built in India by{" "}
            <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="text-[#141413] underline decoration-black/30 underline-offset-4 hover:decoration-black">
              SenseforgeAI
            </a>
            .
          </p>
        </div>
      </section>

      {/* What Aarika does */}
      <section aria-labelledby="what-title" className="border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-3xl">
            <SectionLabel>What Aarika does</SectionLabel>
            <h2 id="what-title" className={`${serif} mt-3 text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
              Plan, practise, apply. In one place.
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {CORE.map((c) => (
              <article key={c.name} className="rounded-[20px] bg-[#f6f5f0] p-7 sm:p-8">
                <p className="flex items-center gap-2.5 text-[17px] font-medium">
                  <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
                  {c.name}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-[#5f5e5a]">{c.desc}</p>
              </article>
            ))}
          </div>
          <ul className="mt-12 grid border-t border-black/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {MORE.map((m, i) => (
              <li key={m.name} className="border-b border-black/[0.08] py-6 sm:pr-8">
                <p className="flex items-center gap-2.5 text-[15px] font-medium">
                  <span className={`h-2 w-2 rounded-full ${DOTS[i % DOTS.length]}`} aria-hidden />
                  {m.name}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#5f5e5a]">{m.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for + exams */}
      <section aria-labelledby="who-title" className="bg-[#f6f5f0]">
        <div className="mx-auto grid max-w-[1200px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionLabel>Who it&apos;s for</SectionLabel>
            <h2 id="who-title" className={`${serif} mt-3 text-[36px] leading-[1.08] tracking-[-0.015em] sm:text-[44px]`}>
              Every stage, from school to switching careers.
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#5f5e5a]">
              A short onboarding tells Aarika where you are, so you only see the tools that matter to you.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {PERSONAS.map((p) => (
                <li key={p} className="rounded-full bg-white px-4 py-2 text-[14px] ring-1 ring-inset ring-black/[0.08]">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionLabel>Exam Simulator</SectionLabel>
            <h2 className={`${serif} mt-3 text-[36px] leading-[1.08] tracking-[-0.015em] sm:text-[44px]`}>
              Mock papers on official patterns.
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#5f5e5a]">
              Timed, with negative marking, instant scores and an explanation for every question.
            </p>
            <ul className="mt-8 grid border-t border-black/[0.1] sm:grid-cols-2">
              {EXAMS.map((e) => (
                <li key={e} className="border-b border-black/[0.1] py-3.5 text-[15px] sm:pr-6">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section aria-labelledby="approach-title" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
        <SectionLabel>Our approach</SectionLabel>
        <h2 id="approach-title" className={`${serif} mt-3 max-w-3xl text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
          Built to be trusted with your career.
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          {APPROACH.map((p, i) => (
            <div key={p.title} className="border-t-2 border-[#141413] pt-6">
              <p className={`${serif} text-[40px] leading-none text-[#3b6cf6]`}>0{i + 1}</p>
              <h3 className="mt-3 text-[18px] font-medium">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5f5e5a]">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" aria-labelledby="contact-title" className="scroll-mt-16 border-t border-black/[0.06]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel>Contact</SectionLabel>
            <h2 id="contact-title" className={`${serif} mt-3 text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
              Talk to the team.
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[#5f5e5a]">
              Questions, partnerships or feedback: reach SenseforgeAI, the company behind Aarika.AI.
            </p>
          </div>
          <ul className="border-t border-black/[0.1] lg:col-span-7">
            {CONTACT.map((c) => (
              <li key={c.label} className="border-b border-black/[0.1]">
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-5 py-6"
                >
                  <c.icon size={20} className="shrink-0 text-[#3b6cf6]" aria-hidden />
                  <span className="w-36 shrink-0 text-[14px] text-[#77756e]">{c.label}</span>
                  <span className="min-w-0 truncate text-[17px] font-medium transition-colors group-hover:text-[#2f5fe8]">{c.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicPage>
  );
}
