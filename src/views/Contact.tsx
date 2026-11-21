import Link from "next/link";
import { PublicPage, SectionLabel, serif } from "@/components/landing/Site";
import { CONTACT } from "@/components/landing/contact";

// Contact page: the same details as the About page's contact section, plus what to send for
// payment questions.

const HELP = [
  { title: "Payments and refunds", body: "Send your registered email address and the Razorpay payment ID from your receipt.", href: "/refund-policy", cta: "Refund & cancellation policy" },
  { title: "Plans and prices", body: "What each plan includes and what you pay, including GST.", href: "/pricing", cta: "See pricing" },
  { title: "Your data", body: "What we collect, why, and how to ask us to delete it.", href: "/privacy", cta: "Privacy policy" },
];

export default function Contact() {
  return (
    <PublicPage cta={false}>
      <section aria-labelledby="contact-title" className="mx-auto max-w-[1200px] px-5 pb-16 pt-16 sm:px-8 sm:pt-24 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel>Contact</SectionLabel>
            <h1 id="contact-title" className={`${serif} mt-4 text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[64px]`}>
              Talk to the team.
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#5f5e5a]">
              Aarika.AI is built and run by SenseforgeAI. Write or call us about your account, payments, partnerships or
              feedback.
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
                  <span className="w-28 shrink-0 text-[14px] text-[#77756e] sm:w-36">{c.label}</span>
                  <span className="min-w-0 truncate text-[17px] font-medium transition-colors group-hover:text-[#2f5fe8]">{c.value}</span>
                </a>
              </li>
            ))}
            <li className="border-b border-black/[0.1] py-6 text-[15px] text-[#5f5e5a]">
              <span className="font-medium text-[#141413]">Business:</span> SenseforgeAI, India. Product: Aarika.AI (aarikaai.in).
            </li>
          </ul>
        </div>
      </section>

      <section aria-label="Helpful links" className="border-t border-black/[0.06]">
        <div className="mx-auto grid max-w-[1200px] gap-4 px-5 py-16 sm:px-8 md:grid-cols-3">
          {HELP.map((h) => (
            <div key={h.title} className="flex flex-col rounded-[20px] bg-[#f6f5f0] p-7">
              <h2 className="text-[17px] font-medium">{h.title}</h2>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#5f5e5a]">{h.body}</p>
              <Link href={h.href} className="mt-6 text-[14px] font-medium text-[#2f5fe8] hover:underline">
                {h.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
