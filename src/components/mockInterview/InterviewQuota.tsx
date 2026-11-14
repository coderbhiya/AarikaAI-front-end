"use client";

// Monthly AI mock-interview allowance (text + live share it): a small counter for the start
// screens and the upgrade prompt shown when a start call returns 402 QUOTA_EXCEEDED.

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/productEvents";
import { Crown, Gauge, ArrowRight } from "lucide-react";
import type { InterviewQuota, QuotaExceeded } from "@/services/mockInterviewService";

const PLAN_LABEL: Record<InterviewQuota["plan"], string> = {
  free: "Free plan",
  basic: "Basic plan",
  professional: "Professional plan",
  admin: "Admin",
};

/** "1 Dec": the allowance resets at 00:00 IST on the 1st, so format in IST. */
export const fmtResetDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

export const quotaUsedUp = (q: InterviewQuota | null) => !!q && !q.unlimited && (q.remaining ?? 0) <= 0;

export function QuotaCounter({ quota, className = "" }: { quota: InterviewQuota; className?: string }) {
  if (quota.unlimited) {
    return (
      <p data-testid="interview-quota" className={`text-xs text-gray-500 inline-flex items-center gap-1.5 ${className}`}>
        <Gauge className="w-3.5 h-3.5 shrink-0" /> Unlimited AI interviews ({PLAN_LABEL[quota.plan]})
      </p>
    );
  }
  const limit = quota.limit ?? 0;
  const left = Math.max(0, quota.remaining ?? 0);
  const empty = left === 0;
  const canUpgrade = empty && quota.plan !== "professional";
  return (
    <p
      data-testid="interview-quota"
      className={`text-xs inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ${empty ? "text-amber-700" : "text-gray-500"} ${className}`}
    >
      <Gauge className="w-3.5 h-3.5 shrink-0" />
      <span>
        <span className="font-semibold">{left} of {limit}</span> {limit === 1 ? "interview" : "interviews"} left this month
        {" "}(resets {fmtResetDate(quota.resetsAt)})
      </span>
      <span className="text-gray-400">· {PLAN_LABEL[quota.plan]}</span>
      {canUpgrade && (
        <Link href="/subscription" onClick={() => trackEvent("upgrade_click", { meta: { from: "quota_counter", plan: quota.plan } })} className="font-semibold text-primary underline underline-offset-2">Upgrade</Link>
      )}
    </p>
  );
}

export function QuotaExceededNotice({ info, className = "" }: { info: QuotaExceeded; className?: string }) {
  const showUpgrade = info.upgradeRequired && !!info.upgradePath;
  const plan = info.quota?.plan;
  useEffect(() => {
    trackEvent("upgrade_prompt_view", { meta: { from: "quota_notice", ...(plan ? { plan } : {}) } });
  }, [plan]);
  return (
    <div data-testid="quota-exceeded" role="alert" className={`rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 ${className}`}>
      <div className="flex gap-3">
        <span className="shrink-0 w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
          <Crown className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">Monthly interview limit reached</p>
          <p className="text-sm text-gray-700 mt-1 break-words">{info.message}</p>
          {showUpgrade && (
            <Link
              href={info.upgradePath!}
              onClick={() => trackEvent("upgrade_click", { meta: { from: "quota_notice", ...(plan ? { plan } : {}) } })}
              data-testid="quota-upgrade"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-blue-600"
            >
              See plans <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
