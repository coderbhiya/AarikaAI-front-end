"use client";

import React from "react";
import { FileText, CheckSquare, Sparkles } from "lucide-react";

interface BriefingCardProps {
  title?: string;
  keyTakeaways?: string[];
  actionItems?: string[];
}

export const BriefingCard: React.FC<BriefingCardProps> = (props) => {
  const title = props.title || "Executive Briefing Sheet";
  const takeaways = props.keyTakeaways || [];
  const actions = props.actionItems || [];

  return (
    <div className="w-full my-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-white shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">AarikaBookLM Executive Briefing</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          <Sparkles className="w-3 h-3 text-slate-500" /> Executive Summary
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4 text-xs text-gray-700">
        {takeaways.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Takeaways
            </h4>
            <ul className="space-y-1.5 pl-4 list-disc text-gray-600">
              {takeaways.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {actions.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5 text-xs">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Recommended Action Items
            </h4>
            <div className="space-y-1.5">
              {actions.map((act, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 text-gray-700">
                  <span className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BriefingCard;
