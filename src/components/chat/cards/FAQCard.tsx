"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

interface FAQCardProps {
  title?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export const FAQCard: React.FC<FAQCardProps> = (props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const title = props.title || "Frequently Asked Questions";
  const faqs = props.faqs || [];

  return (
    <div className="w-full my-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/20 to-indigo-50/30 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sky-100/60 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
            <p className="text-xs text-sky-600 font-medium">Source Grounded FAQ Compiler</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200/50">
          <Sparkles className="w-3 h-3 text-sky-500" /> {faqs.length} Q&As
        </span>
      </div>

      {/* Accordion List */}
      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="rounded-xl border border-gray-200/70 bg-white overflow-hidden shadow-2xs transition-all">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left font-medium text-xs text-gray-800 hover:bg-gray-50/80 transition-colors"
              >
                <span className="pr-4">{idx + 1}. {faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-sky-600" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-sky-50/20">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQCard;
