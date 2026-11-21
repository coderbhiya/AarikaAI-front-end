import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import LandingAuthRedirect from "@/components/landing/LandingAuthRedirect";
import PersonaTabs from "@/components/landing/PersonaTabs";
import { ClosingCta, SectionLabel, serif, SiteFooter, SiteHeader } from "@/components/landing/Site";
import { FAQS, MORE, PERSONAS, PRINCIPLES } from "@/components/landing/content";
import { PricingCards } from "@/components/landing/Pricing";
import { Shot, type Tone } from "@/components/landing/Shot";
import RotatingWord from "@/components/landing/RotatingWord";

// Design: editorial and quiet. Near-monochrome ink on white/ivory, a serif for
// headlines, real product screenshots, thin rules instead of boxes and icons.
// Every feature named here exists in the app today (audited against the code);
// if something leaves the Sidebar, remove it here too.

// Hero headline: "From your first exam to your ___". The first one is the SEO/screen-reader text.
const HERO_ENDINGS = ["next job.", "first offer.", "dream role.", "career switch."];

// Hero extras (all screen sizes). Facts only: each is stated elsewhere on this page or in the app.
// Company logo (+ name where the logo is only a symbol), in brand colours, shown softly beside the hero on xl+ screens
// and as a compact logo cloud under the hero on phones and tablets (< lg).
// Logos: monochrome SVGs from simple-icons@13.21.0 (CC0), saved in /public/landing/logos.
// TCS, Infosys, Wipro and HCL logos already contain the name, so they show alone at a pixel size.
// Google uses its full-colour wordmark (google-wordmark.svg, from Wikimedia Commons).
// Positions are relative to the 896px-wide hero text column (~460px tall on desktop); the side gutter is 120px.
// Keep the lowest logo above the hero screenshot (it starts ~80px below the column).
const HERO_COMPANIES = [
  { name: "Google", logo: "google-wordmark", color: "#4285F4", image: { w: 124, h: 42 }, cls: "-left-[114px] top-[17px]" },
  { name: "TCS", logo: "tcs", color: "#EE3984", wordmark: 54, cls: "-left-[24px] top-[109px]" },
  { name: "Infosys", logo: "infosys", color: "#007CC3", wordmark: 100, cls: "-left-[120px] top-[183px]" },
  { name: "Flipkart", logo: "flipkart", color: "#2874F0", cls: "-left-[60px] top-[306px] text-[26px]" },
  { name: "Oracle", logo: "oracle", color: "#F80000", cls: "-left-[116px] top-[396px] text-[26px]" },
  { name: "Amazon", logo: "amazon", color: "#FF9900", cls: "-right-[104px] top-[28px] text-[30px]" },
  { name: "Adobe", logo: "adobe", color: "#FF0000", cls: "-right-[120px] top-[125px] text-[28px]" },
  { name: "Wipro", logo: "wipro", color: "#341C53", wordmark: 72, cls: "-right-[30px] top-[201px]" },
  { name: "Accenture", logo: "accenture", color: "#A100FF", cls: "-right-[116px] top-[312px] text-[26px]" },
  { name: "HCL", logo: "hcl", color: "#006BB6", wordmark: 120, cls: "-right-[116px] top-[368px]" },
];

// Paints a monochrome SVG in a brand colour (the file is used as a mask).
function logoMask(logo: string, color: string): React.CSSProperties {
  const url = `url(/landing/logos/${logo}.svg)`;
  return {
    backgroundColor: color,
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

const HERO_PROOF = ["Free to start, no card needed", "English, Hindi or Hinglish", "Pay in rupees via Razorpay"];

const SHOWCASE = [
  {
    kicker: "Interviews",
    title: "Sit a real interview before the real one.",
    body: "Practise HR, technical and behavioral rounds in text, or join a live voice interview where Aarika asks, listens and follows up. Every answer is scored, with a stronger sample answer to learn from. Your camera preview never leaves your device.",
    link: { href: "/register", label: "Practise an interview" },
    shot: "/landing/mock-interview.webp",
    tone: "violet" as Tone,
    alt: "Aarika.AI Mock Interview: start a live voice interview or practise HR, technical and behavioral rounds with instant AI feedback",
    w: 1400,
    h: 1050,
  },
  {
    kicker: "Jobs",
    title: "A job agent that does the searching for you.",
    body: "The Job Agent scans company career pages for roles that fit your target role and skills, and tells you why each one matches. Smart Apply then prepares a tailored resume, ATS score, cover letter and form answers, so applying takes minutes.",
    link: { href: "/register", label: "Meet your job agent" },
    shot: "/landing/job-agent.webp",
    tone: "green" as Tone,
    alt: "Aarika.AI Job Agent with matching jobs, match scores and Smart Apply",
    w: 1400,
    h: 1050,
  },
  {
    kicker: "Exams",
    title: "Mock exams that feel like exam day.",
    body: "Timed papers with negative marking, instant scores and an explanation for every question. JEE, NEET, UPSC, SSC CGL, IBPS PO, CAT and CA Foundation follow their official patterns, and you can practise in English, Hindi or Hinglish.",
    link: { href: "/register", label: "Take a mock exam" },
    shot: "/landing/exam-simulator.webp",
    tone: "amber" as Tone,
    alt: "Aarika.AI Exam Simulator setup: choose exam, difficulty, language and paper type",
    w: 1400,
    h: 1050,
  },
];

const DOTS = ["bg-[#3b6cf6]", "bg-[#e0607e]", "bg-[#e8913a]", "bg-[#2fa77a]", "bg-[#8b5cf6]", "bg-[#0ea5e9]", "bg-[#3b6cf6]", "bg-[#2fa77a]"];

export default function Landing() {
  return (
    // html/body are overflow:hidden app-wide, so the landing page scrolls in its own container.
    <div id="top" className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white text-[#141413] antialiased selection:bg-[#141413] selection:text-white">
      <LandingAuthRedirect />

      {/* Minimal bar, no divider. Desktop (lg+): links sit right after the logo, actions on the far right.
          Phones (< md): just Log in + Get started. */}
      <SiteHeader home />

      <main>
        {/* Hero */}
        <section aria-labelledby="hero-title" className="mx-auto max-w-[1200px] px-5 pt-16 max-lg:overflow-x-clip sm:px-8 sm:pt-24 lg:pt-20">
          <div className="relative isolate mx-auto max-w-4xl text-center">
            {/* Backdrop: soft colour glow over a faint grid that fades out at the edges (smaller on phones). */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-[620px] w-[900px] -translate-x-1/2 sm:h-[700px] sm:w-[1200px] lg:-top-24 lg:h-[760px] lg:w-[1400px]" aria-hidden>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,20,19,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,19,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_40%,black,transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(35%_40%_at_32%_35%,rgba(59,108,246,0.12),transparent),radial-gradient(30%_38%_at_70%_40%,rgba(139,92,246,0.11),transparent),radial-gradient(25%_30%_at_50%_75%,rgba(232,145,58,0.07),transparent)]" />
            </div>
            {/* Desktop-only (xl+): soft, brand-coloured logos of big employers in the side gutters, as decoration. */}
            <div className="pointer-events-none absolute inset-0 -z-10 hidden select-none xl:block" aria-hidden>
              {HERO_COMPANIES.map((c) => (
                <span
                  key={c.name}
                  className={`absolute flex items-center gap-[0.3em] whitespace-nowrap font-semibold tracking-tight opacity-[0.3] ${c.cls}`}
                  style={{ color: c.color }}
                >
                  {"image" in c ? (
                    // Full-colour wordmark (Google), used as-is.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/landing/logos/${c.logo}.svg`} alt="" width={c.image?.w} height={c.image?.h} className="block" />
                  ) : "wordmark" in c ? (
                    <span className="block" style={{ width: c.wordmark, height: c.wordmark, ...logoMask(c.logo, c.color) }} />
                  ) : (
                    <>
                      <span className="block h-[1.1em] w-[1.1em]" style={logoMask(c.logo, c.color)} />
                      {c.name}
                    </>
                  )}
                </span>
              ))}
            </div>
            <SectionLabel>Aarika.AI · the AI career co-pilot for India</SectionLabel>
            <h1 id="hero-title" className={`${serif} mt-5 text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[72px] lg:text-[88px]`}>
              From your first exam
              <br className="hidden sm:block" /> to your{" "}
              <em className="italic">
                <RotatingWord
                  words={HERO_ENDINGS}
                  className="bg-gradient-to-r from-[#2f5fe8] to-[#7c4dff] bg-clip-text pr-2 text-transparent"
                />
              </em>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-[#5f5e5a] sm:text-[19px]">
              Plan your career, practise interviews with an AI interviewer, build your resume and find jobs that actually fit,
              in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2f5fe8] px-7 py-3.5 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(47,95,232,0.7)] transition-colors hover:bg-[#2550d0] sm:w-auto"
              >
                Get started, it&apos;s free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3.5 text-[15px] font-medium text-[#141413] ring-1 ring-inset ring-black/15 transition-colors hover:bg-black/[0.03] sm:w-auto"
              >
                Log in
              </Link>
            </div>
            {/* Proof points (desktop only). */}
            <ul className="mt-6 hidden items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[#5f5e5a] lg:flex">
              {HERO_PROOF.map((p) => (
                <li key={p} className="inline-flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.5} className="text-[#2fa77a]" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>

            {/* Phones and tablets (< lg): the same employer logos as the desktop side gutters, as a compact, soft cloud. */}
            <ul className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-4 opacity-50 sm:max-w-xl lg:hidden" aria-hidden>
              {HERO_COMPANIES.map((c) => (
                <li key={c.name} className="flex items-center gap-[0.3em] whitespace-nowrap text-[14px] font-semibold tracking-tight" style={{ color: c.color }}>
                  {"image" in c ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/landing/logos/${c.logo}.svg`} alt="" width={Math.round((c.image?.w ?? 124) * 0.55)} height={Math.round((c.image?.h ?? 42) * 0.55)} className="block" />
                  ) : "wordmark" in c ? (
                    <span className="block" style={{ width: Math.round((c.wordmark ?? 60) * 0.5), height: Math.round((c.wordmark ?? 60) * 0.5), ...logoMask(c.logo, c.color) }} />
                  ) : (
                    <>
                      <span className="block h-[1.1em] w-[1.1em]" style={logoMask(c.logo, c.color)} />
                      {c.name}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <figure className="relative mt-16 sm:mt-20">
            <div className="absolute inset-x-0 -top-10 bottom-10 -z-10 rounded-[48px] bg-[radial-gradient(60%_60%_at_30%_30%,rgba(59,108,246,0.18),transparent),radial-gradient(50%_50%_at_75%_40%,rgba(139,92,246,0.16),transparent)] blur-2xl" aria-hidden />
            <Shot
              tone="blue"
              src="/landing/hero-job-agent.webp"
              alt="The Aarika.AI app: the Job Agent dashboard with matching jobs, match scores and Smart Apply"
              w={1600}
              h={1000}
              priority
            />
            <figcaption className="mt-4 text-center text-[13px] text-[#77756e]">The Job Agent in the Aarika.AI app</figcaption>
          </figure>
        </section>

        {/* Audience line */}
        <section aria-label="Who Aarika.AI is for" className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
          <p className="mx-auto max-w-3xl text-center text-[15px] leading-loose text-[#5f5e5a]">
            Built for{" "}
            {PERSONAS.map((p, i) => (
              <span key={p}>
                <span className="text-[#141413]">{p.toLowerCase()}</span>
                {i < PERSONAS.length - 2 ? ", " : i === PERSONAS.length - 2 ? " and " : "."}
              </span>
            ))}
          </p>
        </section>

        {/* Product showcase */}
        <section id="product" aria-labelledby="product-title" className="scroll-mt-16 border-t border-black/[0.06]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-3xl">
              <SectionLabel>Product</SectionLabel>
              <h2 id="product-title" className={`${serif} mt-3 text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
                Everything your career needs. Nothing it doesn&apos;t.
              </h2>
            </div>

            <div className="mt-16 space-y-24 sm:mt-20 sm:space-y-32">
              {SHOWCASE.map((s, i) => (
                <article key={s.kicker} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                  <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    <SectionLabel>{s.kicker}</SectionLabel>
                    <h3 className={`${serif} mt-3 text-[32px] leading-[1.1] tracking-[-0.01em] sm:text-[40px]`}>{s.title}</h3>
                    <p className="mt-5 text-[16px] leading-relaxed text-[#5f5e5a]">{s.body}</p>
                    <Link href={s.link.href} className="group mt-7 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#141413]">
                      <span className="border-b border-black/30 pb-0.5 transition-colors group-hover:border-black">{s.link.label}</span>
                      <ArrowUpRight size={16} aria-hidden />
                    </Link>
                  </div>
                  <div className={`min-w-0 lg:col-span-7 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <Shot src={s.shot} alt={s.alt} w={s.w} h={s.h} tone={s.tone} />
                  </div>
                </article>
              ))}
            </div>

            {/* Everything else, as a quiet index */}
            <div className="mt-28 sm:mt-36">
              <h3 className={`${serif} text-[32px] leading-tight sm:text-[40px]`}>And the rest of your toolkit</h3>
              <ul className="mt-10 grid border-t border-black/[0.08] sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        </section>

        {/* Personas */}
        <section id="for-you" aria-labelledby="for-you-title" className="scroll-mt-16 bg-[#f6f5f0]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-3xl">
              <SectionLabel>For you</SectionLabel>
              <h2 id="for-you-title" className={`${serif} mt-3 text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
                One app. A different toolkit for every stage.
              </h2>
              <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#5f5e5a]">
                Tell Aarika where you are in a short onboarding, and you only see the tools that matter to you.
              </p>
            </div>
            <div className="mt-14">
              <PersonaTabs />
            </div>
          </div>
        </section>

        {/* Principles */}
        <section aria-labelledby="principles-title" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <SectionLabel>Our approach</SectionLabel>
          <h2 id="principles-title" className={`${serif} mt-3 max-w-3xl text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
            Built to be trusted with your career.
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="border-t-2 border-[#141413] pt-6">
                <p className={`${serif} text-[40px] leading-none text-[#3b6cf6]`}>0{i + 1}</p>
                <h3 className="mt-3 text-[18px] font-medium">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5f5e5a]">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-16 border-t border-black/[0.06]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-3xl">
              <SectionLabel>Pricing</SectionLabel>
              <h2 id="pricing-title" className={`${serif} mt-3 text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
                Start free. Upgrade when you&apos;re ready.
              </h2>
              <p className="mt-5 text-[17px] text-[#5f5e5a]">Prices in rupees, per month. GST extra. Pay by UPI, card or netbanking via Razorpay.</p>
            </div>
            <PricingCards className="mt-14" />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 border-t border-black/[0.06]">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionLabel>FAQ</SectionLabel>
              <h2 id="faq-title" className={`${serif} mt-3 text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
                Questions, answered.
              </h2>
            </div>
            <div className="border-t border-black/[0.1] lg:col-span-8">
              {FAQS.map((f, i) => (
                <details key={f.q} className="group border-b border-black/[0.1] [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left">
                    <h3 className="text-[17px] font-medium">{f.q}</h3>
                    <Plus size={18} className="shrink-0 text-[#77756e] transition-transform duration-200 group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="-mt-1 max-w-2xl pb-7 text-[15px] leading-relaxed text-[#5f5e5a]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <ClosingCta />
      </main>

      <SiteFooter home />
    </div>
  );
}
