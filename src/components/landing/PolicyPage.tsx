import Link from "next/link";
import { PublicPage, SectionLabel, serif } from "@/components/landing/Site";
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/components/landing/contact";

// Layout shared by the policy pages (/refund-policy, /shipping-policy): same look as /terms.

export type PolicySection = { id: string; title: string; points: React.ReactNode[] };

const link = "underline decoration-black/30 underline-offset-4 hover:decoration-black";

export function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className={link}>{children}</Link>
  ) : (
    <a href={href} className={link}>{children}</a>
  );
}

export function PolicyPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: PolicySection[];
}) {
  return (
    <PublicPage cta={false}>
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:pt-20">
        <header className="border-b border-black/[0.08] pb-10">
          <SectionLabel>Legal</SectionLabel>
          <h1 className={`${serif} mt-4 text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[60px]`}>{title}</h1>
          <p className="mt-4 text-[14px] text-[#77756e]">
            Last updated <span className="text-[#141413]">{updated}</span>
          </p>
          <div className="mt-8 text-[17px] leading-relaxed text-[#3d3c39]">{intro}</div>
        </header>

        <nav aria-label="On this page" className="mt-10 rounded-[20px] bg-[#f6f5f0] p-6 sm:p-7">
          <p className="text-[13px] text-[#77756e]">On this page</p>
          <ol className="mt-3 grid gap-x-8 gap-y-2 text-[15px] sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#3d3c39] transition-colors hover:text-[#2f5fe8]">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-6">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-20 border-b border-black/[0.08] py-10">
              <h2 className="flex items-baseline gap-4 text-[22px] font-medium tracking-tight">
                <span className={`${serif} text-[28px] leading-none text-[#3b6cf6]`}>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <ul className="mt-5 space-y-3 text-[16px] leading-relaxed text-[#3d3c39]">
                {s.points.map((p, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[13px] h-px w-3 shrink-0 bg-black/40" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-[15px] leading-relaxed text-[#5f5e5a]">
          Questions? Write to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={`text-[#141413] ${link}`}>{SUPPORT_EMAIL}</a> or call{" "}
          <a href="tel:+919174699025" className={`text-[#141413] ${link}`}>{SUPPORT_PHONE}</a>.
        </p>
      </article>
    </PublicPage>
  );
}
