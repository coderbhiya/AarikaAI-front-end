import Link from "next/link";
import { PublicPage, SectionLabel, serif } from "@/components/landing/Site";
import { PricingCards, inr, payable } from "@/components/landing/Pricing";
import { PLANS } from "@/components/landing/content";

// Public pricing page (no login needed, no redirect for signed-in users either): plan cards plus
// the exact amount Razorpay charges for each plan and cycle, GST included.

const ROWS = PLANS.filter((p) => !("comingSoon" in p && p.comingSoon)).flatMap((p) => [
  { plan: p.name, cycle: "Monthly (30 days)", perMonth: p.price, ...payable(p.price, 1) },
  { plan: p.name, cycle: "Yearly (365 days)", perMonth: p.yearly, ...payable(p.yearly, 12) },
]);

const NOTES = [
  "Creating an account is free. You only pay if you choose a paid plan.",
  "Each plan is a one-time payment. Plans don't renew automatically, so you are never charged again unless you buy again.",
  "Pay by UPI, debit or credit card, or netbanking through Razorpay. All prices are in Indian rupees.",
  "Your plan is activated on your account as soon as the payment goes through.",
];

export default function PricingPage() {
  return (
    <PublicPage>
      <section aria-labelledby="pricing-title" className="mx-auto max-w-[1200px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pt-20">
        <div className="max-w-3xl">
          <SectionLabel>Pricing</SectionLabel>
          <h1 id="pricing-title" className={`${serif} mt-4 text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[64px]`}>
            Start free. Upgrade when you&apos;re ready.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-[#5f5e5a]">
            Prices in rupees, per month. GST extra. Pay by UPI, card or netbanking via Razorpay.
          </p>
        </div>

        <PricingCards className="mt-14" />

        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <h2 className="text-[22px] font-medium tracking-tight">What you pay</h2>
            <p className="mt-2 text-[15px] text-[#5f5e5a]">The total charged at checkout, including 18% GST.</p>
            <div className="mt-6 overflow-x-auto rounded-[20px] ring-1 ring-inset ring-black/[0.08]">
              <table className="w-full min-w-[520px] text-left text-[15px]">
                <thead className="bg-[#f6f5f0] text-[13px] text-[#77756e]">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-normal">Plan</th>
                    <th scope="col" className="px-5 py-3 font-normal">Billing</th>
                    <th scope="col" className="px-5 py-3 text-right font-normal">Price</th>
                    <th scope="col" className="px-5 py-3 text-right font-normal">GST (18%)</th>
                    <th scope="col" className="px-5 py-3 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={`${r.plan}-${r.cycle}`} className="border-t border-black/[0.06]">
                      <td className="px-5 py-4 font-medium">{r.plan}</td>
                      <td className="px-5 py-4 text-[#5f5e5a]">{r.cycle}</td>
                      <td className="px-5 py-4 text-right tabular-nums">₹{inr(r.base)}</td>
                      <td className="px-5 py-4 text-right tabular-nums text-[#5f5e5a]">₹{inr(r.gst)}</td>
                      <td className="px-5 py-4 text-right font-medium tabular-nums">₹{inr(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-[#77756e]">Yearly plans are billed once as 12 × the yearly per-month price. Elite is coming soon and can&apos;t be bought yet.</p>
          </div>

          <div className="lg:col-span-5">
            <h2 className="text-[22px] font-medium tracking-tight">How payment works</h2>
            <ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-[#3d3c39]">
              {NOTES.map((n) => (
                <li key={n} className="flex gap-3">
                  <span className="mt-[11px] h-px w-3 shrink-0 bg-black/40" aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-relaxed text-[#5f5e5a]">
              See our{" "}
              <Link href="/refund-policy" className="text-[#141413] underline decoration-black/30 underline-offset-4 hover:decoration-black">
                refund & cancellation policy
              </Link>{" "}
              and{" "}
              <Link href="/shipping-policy" className="text-[#141413] underline decoration-black/30 underline-offset-4 hover:decoration-black">
                shipping & delivery policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
