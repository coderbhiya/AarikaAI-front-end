import React, { useState } from "react";
import { PlayCircle, Clock, Building2, ShieldCheck, Code2, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import FullExamSimulator from "./FullExamSimulator";

interface CompanyTestCardProps {
  testName: string;
  companyName: string;
  uiTheme?: string;
  durationMinutes?: number;
  tier?: string;
  action?: string;
}

const CompanyTestCard: React.FC<CompanyTestCardProps> = ({
  testName = "TCS NQT",
  companyName = "TCS",
  uiTheme = "tcs_ion",
  durationMinutes = 75,
  tier = "Tier-2",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Map theme badges
  const themeLabel = uiTheme === "tcs_ion" ? "TCS iON Portal UI" : uiTheme === "codesignal" ? "CodeSignal IDE" : "HackerRank IDE";

  const distribution: Record<string, number> = testName.includes("TCS")
    ? { "Numerical Ability": 15, "Verbal Ability": 15, "Reasoning Ability": 15, "Advanced Pseudo-code": 10 }
    : { "Data Structures & Algorithms": 1, "Complex Algorithmic Optimization": 1 };

  const blueprintPayload = {
    exam: `${companyName} - ${testName}`,
    companyName,
    uiTheme,
    language: "English",
    questions: testName.includes("Google") || testName.includes("HackWithInfy") ? 2 : 55,
    durationMinutes: durationMinutes || 75,
    difficulty: { easy: 20, medium: 55, hard: 25 },
    distribution,
  };

  return (
    <>
      <div className="w-full max-w-sm mt-3 bg-gradient-to-b from-white to-gray-50/50 border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden animate-in fade-in duration-300">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
                  {tier}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
                  {themeLabel}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-base leading-tight truncate mt-1">{testName}</h4>
              <p className="text-xs font-medium text-gray-500">{companyName} Recruitment Assessment</p>
            </div>
          </div>

          {/* Test Specs */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
              <Clock className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Duration</span>
                <span className="text-xs font-bold text-gray-900">{durationMinutes} mins</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Environment</span>
                <span className="text-xs font-bold text-gray-900">Proctored OA</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Real-time Sectional Cutoffs & Timers</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Live Multi-language Code Executor</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
          >
            <PlayCircle className="w-4 h-4" /> Start {companyName} Test Portal
          </button>
        </div>
      </div>

      {isOpen &&
        createPortal(
          <FullExamSimulator blueprint={blueprintPayload} onClose={() => setIsOpen(false)} />,
          document.body
        )}
    </>
  );
};

export default CompanyTestCard;
