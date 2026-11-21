"use client";

// Public badge check for recruiters: /verified/<code>. No login needed.

import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, ShieldAlert } from "lucide-react";
import { serif } from "@/components/landing/Site";
import { PublicBadge, fmtDay, getPublicBadge } from "@/services/verificationService";

export default function VerifiedBadge({ code }: { code: string }) {
  const [badge, setBadge] = useState<PublicBadge | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");

  useEffect(() => {
    getPublicBadge(code)
      .then((r) => { setBadge(r.badge); setState("ok"); })
      .catch((err) => setState(err?.response?.status === 404 ? "missing" : "error"));
  }, [code]);

  if (state === "loading") {
    return <div className="py-32 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#77756e]" /></div>;
  }
  if (state !== "ok" || !badge) {
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center">
        <ShieldAlert className="w-10 h-10 mx-auto text-[#b45309]" />
        <h1 className={`${serif} mt-4 text-[36px] leading-tight`}>{state === "missing" ? "Verification not found" : "Couldn't check this badge"}</h1>
        <p className="mt-3 text-[16px] text-[#5f5e5a]">{state === "missing" ? "This link doesn't match any AarikaAI Verified badge." : "Please try again in a minute."}</p>
      </section>
    );
  }

  const valid = badge.status === "valid";
  return (
    <section className="mx-auto max-w-2xl px-5 pb-24 pt-16 sm:pt-20" data-testid="public-badge">
      <div className={`rounded-[24px] p-7 sm:p-9 ${valid ? "bg-gradient-to-br from-[#ecfdf5] via-white to-[#eef2ff] ring-1 ring-[#a7f3d0]" : "bg-[#f6f5f0] ring-1 ring-black/[0.08]"}`}>
        <div className="flex items-center gap-3">
          <span className={`w-12 h-12 rounded-full flex items-center justify-center ${valid ? "bg-[#059669] text-white" : "bg-black/10 text-[#5f5e5a]"}`}>
            {valid ? <BadgeCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </span>
          <div>
            <p className={`text-[13px] font-semibold ${valid ? "text-[#047857]" : "text-[#77756e]"}`}>{valid ? "AarikaAI Verified" : badge.status === "expired" ? "Badge expired" : "Not verified"}</p>
            <p className="text-[13px] text-[#77756e]">{badge.verifiedAt ? `Verified on ${fmtDay(badge.verifiedAt)}` : ""}{badge.expiresAt ? ` · ${valid ? "valid till" : "expired on"} ${fmtDay(badge.expiresAt)}` : ""}</p>
          </div>
        </div>
        <h1 className={`${serif} mt-6 text-[40px] leading-[1.05] tracking-[-0.01em] sm:text-[52px]`}>{badge.name || "AarikaAI candidate"}</h1>
        <p className="mt-2 text-[18px] text-[#3d3c39]">{badge.role} · {badge.round === "technical" ? "Technical" : "HR"} round</p>
        {badge.score != null && (
          <p className="mt-6 flex items-baseline gap-2">
            <span className={`${serif} text-[56px] leading-none`}>{badge.score}</span>
            <span className="text-[15px] text-[#77756e]">/ 100 in a 25-minute live AI interview (80 needed to verify)</span>
          </p>
        )}
        {badge.summary && <p className="mt-6 text-[16px] leading-relaxed text-[#3d3c39]">{badge.summary}</p>}
        {(badge.strengths.length > 0 || badge.improvements.length > 0) && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {badge.strengths.length > 0 && (
              <div className="rounded-[16px] bg-white/70 p-4 ring-1 ring-black/[0.06]">
                <p className="text-[13px] font-semibold text-[#047857]">Strengths</p>
                <ul className="mt-2 space-y-1.5 text-[14px] text-[#3d3c39]">{badge.strengths.map((s) => <li key={s}>• {s}</li>)}</ul>
              </div>
            )}
            {badge.improvements.length > 0 && (
              <div className="rounded-[16px] bg-white/70 p-4 ring-1 ring-black/[0.06]">
                <p className="text-[13px] font-semibold text-[#b45309]">To improve</p>
                <ul className="mt-2 space-y-1.5 text-[14px] text-[#3d3c39]">{badge.improvements.map((s) => <li key={s}>• {s}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="mt-6 text-[13px] leading-relaxed text-[#77756e]">
        The candidate took a scheduled live voice interview with Aarika, the AarikaAI interviewer. The score and summary are produced by AI from the
        interview and are one input for your hiring decision, not a guarantee.
      </p>
    </section>
  );
}
