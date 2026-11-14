import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import BrainLogo from "@/components/BrainLogo";
import LandingAuthRedirect from "@/components/landing/LandingAuthRedirect";
import PersonaTabs from "@/components/landing/PersonaTabs";
import { displaySerif } from "@/components/landing/fonts";
import { FAQS, PLANS } from "@/components/landing/content";

// Design: editorial and quiet. Near-monochrome ink on white/ivory, a serif for
// headlines, real product screenshots, thin rules instead of boxes and icons.
// Every feature named here exists in the app today (audited against the code);
// if something leaves the Sidebar, remove it here too.

const serif = displaySerif.className;

const PERSONAS = ["School students", "College students", "Job seekers", "Working professionals", "Career switchers", "Govt exam aspirants"];

const SHOWCASE = [
  {
    kicker: "Interviews",
    title: "Sit a real interview before the real one.",
    body: "Practise HR, technical and behavioral rounds in text, or join a live voice interview where Aarika asks, listens and follows up. Every answer is scored, with a stronger sample answer to learn from. Your camera preview never leaves your device.",
    link: { href: "/register", label: "Practise an interview" },
    shot: "/landing/mock-interview.webp",
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
    alt: "Aarika.AI Exam Simulator setup: choose exam, difficulty, language and paper type",
    w: 1400,
    h: 1050,
  },
];

const MORE = [
  { name: "AI career chat", desc: "Career answers that use your profile, in English, Hindi or Hinglish." },
  { name: "Resume Builder", desc: "Clean PDF resumes, tailored to a job description, with an ATS keyword check." },
  { name: "Mission Hunt", desc: "A job feed that only shows roles matched to your skills and target role." },
  { name: "Internships", desc: "Internships and fresher jobs ranked by fit, with an application tracker." },
  { name: "Career Discovery", desc: "A 30-question quiz that suggests your best-fit stream and careers." },
  { name: "Exams & Scholarships", desc: "One calendar, with eligibility checked against your profile." },
  { name: "AI Tools", desc: "Campus placement prep, skill gap & SWOT, roadmaps, study guides and more." },
  { name: "My Learning", desc: "Your courses in one workspace, with notes saved for each one." },
];

const PRINCIPLES = [
  { title: "What you see is the product", body: "Every screenshot on this page is the real app. No mock-ups, no made-up numbers." },
  { title: "Private by design", body: "In live interviews your camera stays on your device; only your voice reaches the AI interviewer." },
  { title: "Made for India", body: "Built by SenseforgeAI for Indian exams, campuses and job markets. Pay in rupees via Razorpay." },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "#product", label: "Features" },
      { href: "#for-you", label: "For you" },
      { href: "#pricing", label: "Pricing" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/reviews", label: "Reviews" },
      { href: "/community", label: "Community" },
      { href: "/updates-faq", label: "Updates" },
      { href: "/open-jobs", label: "Open jobs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

function Shot({ src, alt, w, h, priority = false }: { src: string; alt: string; w: number; h: number; priority?: boolean }) {
  return (
    <div className="rounded-[20px] bg-[#f0eee6] p-2 sm:p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="block h-auto w-full rounded-[14px] border border-black/[0.06] bg-white"
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-medium text-[#77756e]">{children}</p>;
}

export default function Landing() {
  return (
    // html/body are overflow:hidden app-wide, so the landing page scrolls in its own container.
    <div id="top" className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white text-[#141413] antialiased selection:bg-[#141413] selection:text-white">
      <LandingAuthRedirect />

      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Aarika.AI home">
            <BrainLogo size={28} className="rounded-md" />
            <span className="text-[17px] font-semibold tracking-tight">Aarika.AI</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[14px] text-[#5f5e5a] md:flex" aria-label="Main">
            <a href="#product" className="transition-colors hover:text-[#141413]">Product</a>
            <a href="#for-you" className="transition-colors hover:text-[#141413]">For you</a>
            <a href="#pricing" className="transition-colors hover:text-[#141413]">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-[#141413]">FAQ</a>
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link href="/login" className="rounded-full px-3.5 py-2 text-[14px] text-[#141413] transition-colors hover:bg-black/[0.04]">
              Log in
            </Link>
            <Link href="/register" className="rounded-full bg-[#141413] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-black/80">
              Get started
            </Link>
          </div>
        </div>
        <div className="h-px bg-black/[0.06]" />
      </header>

      <main>
        {/* Hero */}
        <section aria-labelledby="hero-title" className="mx-auto max-w-[1200px] px-5 pt-16 sm:px-8 sm:pt-24 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <SectionLabel>Aarika.AI · the AI career co-pilot for India</SectionLabel>
            <h1 id="hero-title" className={`${serif} mt-5 text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[72px] lg:text-[88px]`}>
              From your first exam
              <br className="hidden sm:block" /> to your <em className="italic">next job.</em>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-[#5f5e5a] sm:text-[19px]">
              Plan your career, practise interviews with an AI interviewer, build your resume and find jobs that actually fit,
              in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#141413] px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-black/80 sm:w-auto"
              >
                Get started, it&apos;s free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-medium text-[#141413] ring-1 ring-inset ring-black/15 transition-colors hover:bg-black/[0.03] sm:w-auto"
              >
                Log in
              </Link>
            </div>
            <p className="mt-5 text-[13px] text-[#77756e]">Sign up with email, Google or LinkedIn. No card needed.</p>
          </div>

          <figure className="mt-16 sm:mt-20">
            <Shot
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
                    <Shot src={s.shot} alt={s.alt} w={s.w} h={s.h} />
                  </div>
                </article>
              ))}
            </div>

            {/* Everything else, as a quiet index */}
            <div className="mt-28 sm:mt-36">
              <h3 className={`${serif} text-[32px] leading-tight sm:text-[40px]`}>And the rest of your toolkit</h3>
              <ul className="mt-10 grid border-t border-black/[0.08] sm:grid-cols-2 lg:grid-cols-4">
                {MORE.map((m) => (
                  <li key={m.name} className="border-b border-black/[0.08] py-6 sm:pr-8">
                    <p className="text-[15px] font-medium">{m.name}</p>
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
              <div key={p.title} className="border-t border-[#141413] pt-6">
                <p className="text-[13px] text-[#77756e]">0{i + 1}</p>
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
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => {
                const popular = "popular" in plan && plan.popular;
                const comingSoon = "comingSoon" in plan && plan.comingSoon;
                return (
                  <article
                    key={plan.name}
                    className={`flex flex-col rounded-[20px] p-7 sm:p-8 ${popular ? "bg-[#141413] text-white" : "bg-[#f6f5f0] text-[#141413]"}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-[17px] font-medium">{plan.name}</h3>
                      {popular && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[12px]">Most popular</span>}
                      {comingSoon && <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[12px] text-[#5f5e5a]">Coming soon</span>}
                    </div>
                    <p className={`mt-2 text-[14px] ${popular ? "text-white/70" : "text-[#5f5e5a]"}`}>{plan.desc}</p>
                    <p className="mt-8 flex items-baseline gap-1.5">
                      <span className={`${serif} text-[56px] leading-none`}>₹{plan.price}</span>
                      <span className={`text-[14px] ${popular ? "text-white/60" : "text-[#77756e]"}`}>/ month</span>
                    </p>
                    <p className={`mt-2 text-[13px] ${popular ? "text-white/60" : "text-[#77756e]"}`}>₹{plan.yearly}/month billed yearly</p>
                    <ul className={`mt-8 flex-1 space-y-3 border-t pt-6 text-[14px] ${popular ? "border-white/15 text-white/85" : "border-black/[0.08] text-[#3d3c39]"}`}>
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-3">
                          <span className={`mt-[9px] h-px w-3 shrink-0 ${popular ? "bg-white/50" : "bg-black/40"}`} aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {comingSoon ? (
                      <span className="mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-[14px] text-[#77756e] ring-1 ring-inset ring-black/10">
                        Coming soon
                      </span>
                    ) : (
                      <Link
                        href="/register"
                        className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-[14px] font-medium transition-colors ${
                          popular ? "bg-white text-[#141413] hover:bg-white/90" : "bg-[#141413] text-white hover:bg-black/80"
                        }`}
                      >
                        Get started
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
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

        {/* Closing CTA */}
        <section aria-labelledby="cta-title" className="bg-[#f6f5f0]">
          <div className="mx-auto max-w-[1200px] px-5 py-24 text-center sm:px-8 sm:py-32">
            <h2 id="cta-title" className={`${serif} mx-auto max-w-3xl text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[72px]`}>
              Your next step starts <em className="italic">here.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[17px] text-[#5f5e5a]">Create your free account and let Aarika build your plan today.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#141413] px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-black/80 sm:w-auto"
              >
                Get started, it&apos;s free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-medium ring-1 ring-inset ring-black/15 transition-colors hover:bg-black/[0.03] sm:w-auto"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06]">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link href="/" className="flex items-center gap-2">
              <BrainLogo size={26} className="rounded-md" />
              <span className="text-[16px] font-semibold">Aarika.AI</span>
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#5f5e5a]">
              The AI career co-pilot for students, job seekers and professionals in India.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="md:col-span-2">
              <h2 className="text-[13px] text-[#77756e]">{col.title}</h2>
              <ul className="mt-4 space-y-3 text-[14px]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("#") ? (
                      <a href={l.href} className="text-[#3d3c39] transition-colors hover:text-[#141413]">{l.label}</a>
                    ) : (
                      <Link href={l.href} className="text-[#3d3c39] transition-colors hover:text-[#141413]">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 border-t border-black/[0.06] px-5 py-6 text-[13px] text-[#77756e] sm:flex-row sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} Aarika.AI by{" "}
            <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="text-[#3d3c39] hover:underline">
              SenseforgeAI
            </a>
          </p>
          <p>Made in India</p>
        </div>
      </footer>
    </div>
  );
}
