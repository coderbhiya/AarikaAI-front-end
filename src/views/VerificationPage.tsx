"use client";

// Get Verified: book a live AI interview at a time you choose. Score 80+ to earn a
// "Verified: <role>" badge for 12 months, which recruiters can check through a public link.

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, CalendarClock, Copy, Loader2, Video, XCircle, Clock, ShieldCheck, ExternalLink, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { PAGE_COLUMN, PageHeader } from "@/components/layout/PageHeader";
import { getProfile } from "@/services/profileService";
import {
  VerificationItem, VerificationOverview, VerificationRound, badgeLink, cancelVerification, fmtDay, fmtWhen,
  getVerifications, rescheduleVerification, scheduleVerification,
} from "@/services/verificationService";

const errMsg = (err: any, fallback: string) => err?.response?.data?.message || fallback;

const STATUS: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "Booked", cls: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In progress", cls: "bg-amber-50 text-amber-700" },
  passed: { label: "Verified", cls: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Not verified", cls: "bg-red-50 text-red-600" },
  missed: { label: "Missed", cls: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-500" },
};
const ROUND_LABEL: Record<VerificationRound, string> = { hr: "HR round", technical: "Technical round" };

/** Value for <input type="datetime-local"> in the viewer's time zone. */
const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const nextHalfHour = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return d;
};

function BadgeCard({ b }: { b: VerificationItem }) {
  const link = b.publicCode ? badgeLink(b.publicCode) : null;
  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Verification link copied");
    } catch {
      toast.error("Couldn't copy. Select the link and copy it.");
    }
  };
  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 flex flex-col sm:flex-row sm:items-center gap-4" data-testid="verified-badge">
      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"><BadgeCheck className="w-6 h-6" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">AarikaAI Verified</p>
        <p className="text-base font-bold text-gray-900 truncate">{b.targetRole}</p>
        <p className="text-xs text-gray-600">{ROUND_LABEL[b.interviewType]} · Score {b.overallScore}/100 · Valid till {b.expiresAt ? fmtDay(b.expiresAt) : "—"}</p>
        {link && <p className="text-xs text-gray-500 mt-1 truncate">{link}</p>}
      </div>
      {link && (
        <div className="flex gap-2 shrink-0">
          <button onClick={copy} className="px-3.5 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy link</button>
          <a href={link} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-700 inline-flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> View</a>
        </div>
      )}
    </div>
  );
}

function UpcomingCard({ v, onChanged }: { v: VerificationItem; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [when, setWhen] = useState(toLocalInput(new Date(v.scheduledAt)));
  const [busy, setBusy] = useState(false);
  const open = v.status === "scheduled" && v.joinState === "open";

  const save = async () => {
    setBusy(true);
    try {
      await rescheduleVerification(v.id, new Date(when).toISOString());
      toast.success("Interview moved");
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error(errMsg(err, "Could not reschedule"));
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    if (!window.confirm("Cancel this verification interview?")) return;
    setBusy(true);
    try {
      await cancelVerification(v.id);
      toast.success("Interview cancelled");
      onChanged();
    } catch (err) {
      toast.error(errMsg(err, "Could not cancel"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-5 space-y-4" data-testid="upcoming-verification">
      <div className="flex items-start gap-3">
        <CalendarClock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">{v.status === "in_progress" ? "Interview in progress" : "Your verification interview"}</p>
          <p className="text-base font-bold text-gray-900">{v.targetRole} · {ROUND_LABEL[v.interviewType]}</p>
          <p className="text-sm text-gray-600">{fmtWhen(v.scheduledAt)}</p>
          {v.status === "scheduled" && !open && (
            <p className="text-xs text-gray-500 mt-1">The room opens at {fmtWhen(v.opensAt)} and closes at {fmtWhen(v.closesAt)}. We&apos;ll remind you a day before, an hour before and at the time.</p>
          )}
          {v.status === "in_progress" && <p className="text-xs text-amber-700 mt-1">This interview was started. Finish the call to get your result.</p>}
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} min={toLocalInput(new Date())}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-600" aria-label="New date and time" />
          <button onClick={save} disabled={busy} className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold disabled:opacity-60">Save</button>
          <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600">Back</button>
        </div>
      ) : v.status === "scheduled" ? (
        <div className="flex flex-wrap gap-2">
          {open ? (
            <a href={`/mock-interview/live?verificationId=${v.id}`} className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold inline-flex items-center gap-2" data-testid="join-verification">
              <Video className="w-4 h-4" /> Join interview
            </a>
          ) : (
            <span className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-500 text-sm font-bold inline-flex items-center gap-2"><Clock className="w-4 h-4" /> Join opens {fmtWhen(v.opensAt)}</span>
          )}
          <button onClick={() => setEditing(true)} disabled={busy} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-700">Reschedule</button>
          <button onClick={cancel} disabled={busy} className="px-4 py-2 rounded-full text-xs font-semibold text-gray-500 hover:text-red-600">Cancel</button>
        </div>
      ) : null}
    </div>
  );
}

export default function VerificationPage() {
  const [data, setData] = useState<VerificationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notEligible, setNotEligible] = useState<string | null>(null);

  const [role, setRole] = useState("");
  const [round, setRound] = useState<VerificationRound>("technical");
  const [when, setWhen] = useState(toLocalInput(nextHalfHour()));
  const [booking, setBooking] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setData(await getVerifications());
    } catch (err: any) {
      if (err?.response?.status === 403) setNotEligible(errMsg(err, "Verification interviews aren't available for your profile."));
      else setError(errMsg(err, "Could not load your verification interviews"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getProfile()
      .then((r: any) => {
        const p = r?.user?.UserProfile;
        const target = p?.targetRole || p?.currentRole || p?.careerSwitcherDetails?.targetDomain || "";
        if (target) setRole((cur) => cur || String(target));
      })
      .catch(() => {});
  }, []);

  const active = useMemo(() => data?.items.find((i) => i.status === "scheduled" || i.status === "in_progress") || null, [data]);
  const past = useMemo(() => (data?.items || []).filter((i) => i !== active && i.status !== "scheduled" && i.status !== "in_progress"), [data, active]);
  const rules = data?.rules;

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      toast.error("Which role do you want to get verified for?");
      return;
    }
    setBooking(true);
    try {
      await scheduleVerification({ targetRole: role.trim(), interviewType: round, scheduledAt: new Date(when).toISOString() });
      toast.success("Interview booked. We've sent you the details.");
      await load();
    } catch (err) {
      toast.error(errMsg(err, "Could not book the interview"));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F8FAFC] relative overflow-y-auto overflow-x-hidden">
      <PageHeader icon={<BadgeCheck />} title="Get Verified" />
      <main className={`${PAGE_COLUMN} py-6 space-y-6`}>
        <section className="rounded-2xl p-5 sm:p-7 bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#14532D] text-white shadow-xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest bg-white/15 rounded-full px-2.5 py-1"><ShieldCheck className="w-3.5 h-3.5" /> AarikaAI Verified</span>
          <h1 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight">Prove your skills with one AI interview</h1>
          <p className="text-sm text-gray-200 mt-2 leading-relaxed max-w-2xl">
            Book a {rules?.durationMin ?? 25}-minute live voice interview with Aarika, our AI interviewer, at a time that suits you.
            Score {rules?.passScore ?? 80} or more to earn a Verified badge for the role. Recruiters see your badge, score and a short summary,
            and can check it with your verification link. The badge is valid for 12 months.
          </p>
        </section>

        {notEligible ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">{notEligible}</p>
        ) : loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : error ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> <span className="flex-1">{error}</span>
            <button onClick={load} className="text-xs font-bold text-primary">Retry</button>
          </div>
        ) : data ? (
          <>
            {data.badges.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-900">Your badges</h2>
                {data.badges.map((b) => <BadgeCard key={b.id} b={b} />)}
              </section>
            )}

            {active ? (
              <UpcomingCard v={active} onChanged={load} />
            ) : !data.canSchedule.ok && data.canSchedule.reason === "cooldown" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                You can book your next verification interview from <b>{fmtWhen(data.canSchedule.nextAllowedAt)}</b> ({rules?.retakeDays ?? 7} days after your last attempt).
                Practise with <a href="/mock-interview" className="font-semibold underline">mock interviews</a> in the meantime.
              </div>
            ) : (
              <form onSubmit={book} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-5" data-testid="book-verification">
                <h2 className="text-base font-bold text-gray-900">Book your verification interview</h2>
                <div>
                  <label htmlFor="vf-role" className="text-sm font-semibold text-gray-800">Role to get verified for</label>
                  <input id="vf-role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="e.g. Frontend Developer, Data Analyst"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Round</p>
                  <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {([["technical", "Technical round", "Concepts and a live coding exercise"], ["hr", "HR round", "Motivation, situations, communication"]] as const).map(([id, label, desc]) => (
                      <button key={id} type="button" onClick={() => setRound(id)} aria-pressed={round === id}
                        className={`text-left rounded-xl border p-3 ${round === id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                        <span className="block text-sm font-semibold text-gray-900">{label}</span>
                        <span className="block text-xs text-gray-500">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="vf-when" className="text-sm font-semibold text-gray-800">Date and time</label>
                  <input id="vf-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} min={toLocalInput(new Date())}
                    className="mt-1.5 w-full sm:w-auto rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  <p className="text-xs text-gray-500 mt-1">Any time in the next {rules?.maxDaysAhead ?? 30} days. You can join from {rules?.joinEarlyMin ?? 15} minutes before until {rules?.joinLateMin ?? 60} minutes after.</p>
                </div>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Use headphones and a quiet room. Keep {rules?.durationMin ?? 25} minutes free.</li>
                  <li>• You get one attempt per booking. If you don&apos;t pass, you can try again after {rules?.retakeDays ?? 7} days.</li>
                  <li>• Verification interviews don&apos;t use your monthly mock interview allowance.</li>
                </ul>
                <button type="submit" disabled={booking} className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-60">
                  {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />} Book interview
                </button>
              </form>
            )}

            {past.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-gray-900">Past attempts</h2>
                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                  {past.map((v) => {
                    const st = STATUS[v.status] || STATUS.cancelled;
                    return (
                      <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                        {v.status === "passed" ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-gray-400 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{v.targetRole} · {ROUND_LABEL[v.interviewType]}</p>
                          <p className="text-xs text-gray-500">{fmtWhen(v.scheduledAt)}{v.failReasonText ? ` · ${v.failReasonText}` : ""}</p>
                        </div>
                        {v.overallScore != null && <span className="text-sm font-bold text-gray-700">{v.overallScore}/100</span>}
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
