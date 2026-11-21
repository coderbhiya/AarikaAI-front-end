import Link from "next/link";
import { serif } from "@/components/landing/Site";
import { PLANS } from "@/components/landing/content";

// Plan cards shown on the landing page (#pricing) and on /pricing. Prices must match
// PLAN_PRICES_INR in the backend's paymentController.js, which is what Razorpay charges.

export const GST_RATE = 0.18;

/** Rupees with paise, Indian grouping: 3525.84 → "3,525.84". */
export const inr = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** What Razorpay charges for a plan: monthly price, or 12 × the yearly per-month rate, plus 18% GST. */
export function payable(perMonth: number, months: 1 | 12) {
  const base = perMonth * months;
  return { base, gst: Math.round(base * GST_RATE * 100) / 100, total: Math.round(base * (1 + GST_RATE) * 100) / 100 };
}

export function PricingCards({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {PLANS.map((plan) => {
        const popular = "popular" in plan && plan.popular;
        const comingSoon = "comingSoon" in plan && plan.comingSoon;
        return (
          <article
            key={plan.name}
            className={`flex flex-col rounded-[20px] p-7 sm:p-8 ${popular ? "bg-gradient-to-br from-[#14213f] via-[#1b2f6b] to-[#3a2f8f] text-white shadow-[0_30px_60px_-25px_rgba(30,50,140,0.6)]" : "bg-[#f6f5f0] text-[#141413]"}`}
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
  );
}
