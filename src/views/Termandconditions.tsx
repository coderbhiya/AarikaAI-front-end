import Link from "next/link";
import { PublicPage, SectionLabel, serif } from "@/components/landing/Site";

// Terms of service. These are the same nine points the page always had (previously written in
// sci-fi wording: "orbital cycles", "parental node synchronization", "India node"), restated in
// plain English with no new obligations added. Have them reviewed by a lawyer before relying on them.

const SECTIONS = [
  {
    id: "eligibility",
    title: "Who can use Aarika.AI",
    points: [
      "You must be at least 16 years old to create an account.",
      "If you are under 18, you need permission from a parent or guardian to use Aarika.AI.",
    ],
  },
  {
    id: "use",
    title: "Using the service",
    points: [
      "Don't misuse Aarika.AI: don't try to break, overload or get unauthorised access to the service or other users' data.",
      "You are responsible for keeping your account login details secure.",
    ],
  },
  {
    id: "ownership",
    title: "Ownership",
    points: [
      "The Aarika.AI software, AI models, code and design belong to Aarika.AI.",
      "You may not copy or redistribute them without our permission.",
    ],
  },
  {
    id: "liability",
    title: "No guarantees",
    points: [
      "Aarika.AI gives career guidance and practice, but does not guarantee a job, placement or exam result.",
      "You use the service at your own risk.",
    ],
  },
  {
    id: "termination",
    title: "Suspending accounts",
    points: ["We may suspend or close an account that breaks these terms."],
  },
  {
    id: "law",
    title: "Governing law",
    points: ["These terms are governed by the laws of India."],
  },
];

export default function Termandconditions() {
  return (
    <PublicPage cta={false}>
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:pt-20">
        <header className="border-b border-black/[0.08] pb-10">
          <SectionLabel>Legal</SectionLabel>
          <h1 className={`${serif} mt-4 text-[48px] leading-[1.02] tracking-[-0.02em] sm:text-[64px]`}>Terms of service</h1>
          <p className="mt-4 text-[14px] text-[#77756e]">
            Last updated <span className="text-[#141413]">1 October 2025</span>
          </p>
          <p className="mt-8 text-[17px] leading-relaxed text-[#3d3c39]">
            These terms apply when you use Aarika.AI, the AI career co-pilot run by SenseforgeAI. By creating an account or
            using the service, you agree to them. How we handle your data is covered in our{" "}
            <Link href="/privacy" className="underline decoration-black/30 underline-offset-4 hover:decoration-black">
              privacy policy
            </Link>
            .
          </p>
        </header>

        <nav aria-label="On this page" className="mt-10 rounded-[20px] bg-[#f6f5f0] p-6 sm:p-7">
          <p className="text-[13px] text-[#77756e]">On this page</p>
          <ol className="mt-3 grid gap-x-8 gap-y-2 text-[15px] sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#3d3c39] transition-colors hover:text-[#2f5fe8]">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-6">
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-20 border-b border-black/[0.08] py-10">
              <h2 className="flex items-baseline gap-4 text-[22px] font-medium tracking-tight">
                <span className={`${serif} text-[28px] leading-none text-[#3b6cf6]`}>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <ul className="mt-5 space-y-3 text-[16px] leading-relaxed text-[#3d3c39]">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-[13px] h-px w-3 shrink-0 bg-black/40" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-[15px] leading-relaxed text-[#5f5e5a]">
          Questions about these terms? Write to{" "}
          <a href="mailto:dave@senseforge.in" className="text-[#141413] underline decoration-black/30 underline-offset-4 hover:decoration-black">
            dave@senseforge.in
          </a>
          .
        </p>
      </article>
    </PublicPage>
  );
}
