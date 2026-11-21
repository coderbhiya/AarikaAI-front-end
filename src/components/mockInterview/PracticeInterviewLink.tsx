"use client";

import Link from "next/link";
import { Mic } from "lucide-react";
import { practiceInterviewHref } from "@/components/mockInterview/JobTargetPicker";

/** "Practice interview" for one job: opens the mock interview setup ready for that job. */
export default function PracticeInterviewLink({
  jobId,
  companyJobId,
  title,
  company,
  className = "",
  label = "Practice interview",
}: {
  jobId?: number | null;
  companyJobId?: number | null;
  title?: string | null;
  company?: string | null;
  className?: string;
  label?: string;
}) {
  if (!jobId && !companyJobId) return null;
  return (
    <Link
      href={practiceInterviewHref({ jobId, companyJobId, title, company })}
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-primary hover:text-primary ${className}`}
      data-testid="practice-interview-link"
    >
      <Mic className="w-3.5 h-3.5" aria-hidden /> {label}
    </Link>
  );
}
