"use client";

// Fresher core loop: mock interview → feedback → resume → apply.
// Shown under an interview report so the next step is one click away.

import Link from "next/link";
import { FileText, Briefcase, ArrowRight } from "lucide-react";

export default function InterviewNextSteps({ targetRole, className = "" }: { targetRole?: string | null; className?: string }) {
  const role = (targetRole || "").trim();
  const q = role ? `?${new URLSearchParams({ role }).toString()}` : "";
  const jobsHref = role ? `/jobs?${new URLSearchParams({ search: role }).toString()}` : "/jobs";
  const steps = [
    {
      href: `/resume-builder${q}`,
      icon: <FileText className="w-5 h-5" />,
      title: role ? `Get your resume ready for ${role}` : "Get your resume ready",
      body: "Check your ATS score for this role and tighten the bullets interviewers will ask about.",
      testId: "next-step-resume",
    },
    {
      href: jobsHref,
      icon: <Briefcase className="w-5 h-5" />,
      title: role ? `Find ${role} openings` : "Find openings",
      body: "See matching jobs and apply with Smart Apply while the practice is fresh.",
      testId: "next-step-jobs",
    },
  ];
  return (
    <section data-testid="interview-next-steps" className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-bold text-gray-900">Next steps</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            data-testid={s.testId}
            className="group bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 hover:border-primary/40 hover:shadow-sm transition"
          >
            <span className="shrink-0 w-9 h-9 rounded-full bg-blue-50 text-primary flex items-center justify-center">{s.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-semibold text-gray-900 break-words">
                {s.title}
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-0.5 block text-xs text-gray-600">{s.body}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
