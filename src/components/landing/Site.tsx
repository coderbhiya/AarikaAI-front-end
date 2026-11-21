import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import BrainLogo from "@/components/BrainLogo";
import { displaySerif } from "@/components/landing/fonts";

// Shared chrome for the public (logged-out) site: the landing page at / and the pages it links to
// (/about, /pricing, /contact, /privacy, /terms, /refund-policy, /shipping-policy, /open-jobs). Same navbar, footer, colours and type everywhere.

export const serif = displaySerif.className;

const NAV = [
  { hash: "#product", label: "Product" },
  { hash: "#for-you", label: "For you" },
  { hash: "#pricing", label: "Pricing" },
  { hash: "#faq", label: "FAQ" },
];

// Only pages a logged-out visitor can actually open (Reviews, Community and Updates need a login).
const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "#product", label: "Features" },
      { href: "#for-you", label: "For you" },
      { href: "/pricing", label: "Pricing" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/open-jobs", label: "Open jobs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refund-policy", label: "Refund & cancellation" },
      { href: "/shipping-policy", label: "Shipping & delivery" },
    ],
  },
];

/** Section anchors live on the landing page; from any other page they point back to it. */
const anchor = (hash: string, home: boolean) => (home ? hash : `/${hash}`);

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[#3b6cf6]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#3b6cf6]" aria-hidden />
      {children}
    </p>
  );
}

export function SiteHeader({ home = false }: { home?: boolean }) {
  return (
    // Minimal bar, no divider. Desktop (lg+): links sit right after the logo, actions on the far right.
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl lg:bg-white/90">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Aarika.AI home">
          <BrainLogo size={28} className="rounded-md" />
          <span className="text-[17px] font-semibold tracking-tight">Aarika.AI</span>
        </Link>
        <nav
          className="hidden items-center gap-8 text-[14px] text-[#5f5e5a] md:flex lg:ml-12 lg:mr-auto lg:gap-1 lg:text-[#141413]"
          aria-label="Main"
        >
          {NAV.map((l) => (
            <a
              key={l.hash}
              href={anchor(l.hash, home)}
              className="transition-colors hover:text-[#141413] lg:rounded-full lg:px-3.5 lg:py-2 lg:hover:bg-black/[0.05]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/login" className="rounded-full px-3.5 py-2 text-[14px] text-[#141413] transition-colors hover:bg-black/[0.04]">
            Log in
          </Link>
          <Link
            href="/register"
            className="group inline-flex items-center gap-1 rounded-full bg-[#141413] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-black/80"
          >
            Get started
            <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ home = false }: { home?: boolean }) {
  return (
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
                    <a href={anchor(l.href, home)} className="text-[#3d3c39] transition-colors hover:text-[#141413]">{l.label}</a>
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
  );
}

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-gradient-to-br from-[#dfe8ff] via-[#efe9ff] to-[#fde9e4]">
      <div className="mx-auto max-w-[1200px] px-5 py-24 text-center sm:px-8 sm:py-32">
        <h2 id="cta-title" className={`${serif} mx-auto max-w-3xl text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[72px]`}>
          Your next step starts <em className="bg-gradient-to-r from-[#2f5fe8] to-[#7c4dff] bg-clip-text pr-2 italic text-transparent">here.</em>
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
  );
}

/**
 * Page frame for public pages. html/body are overflow:hidden app-wide, so the page scrolls in its own container
 * (same as the landing page).
 */
export function PublicPage({ children, cta = true }: { children: React.ReactNode; cta?: boolean }) {
  return (
    <div className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white text-[#141413] antialiased selection:bg-[#141413] selection:text-white">
      <SiteHeader />
      <main>
        {children}
        {cta && <ClosingCta />}
      </main>
      <SiteFooter />
    </div>
  );
}
