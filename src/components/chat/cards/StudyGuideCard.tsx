"use client";

import React, { useState } from "react";
import { BookOpen, Key, CheckCircle, HelpCircle, Sparkles } from "lucide-react";

interface StudyGuideCardProps {
  title?: string;
  subject?: string;
  summary?: string;
  keyTerms?: Array<{ term: string; definition: string }>;
  coreConcepts?: Array<{ topic: string; notes: string }>;
  selfTestQuiz?: Array<{ question: string; optionA: string; optionB: string; answer: string }>;
}

export const StudyGuideCard: React.FC<StudyGuideCardProps> = (props) => {
  const [activeTab, setActiveTab] = useState<"summary" | "terms" | "concepts" | "quiz">("summary");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const title = props.title || "Study Guide";
  const summary = props.summary || "Comprehensive breakdown of key concepts for quick revision.";
  const keyTerms = props.keyTerms || [];
  const coreConcepts = props.coreConcepts || [];
  const quiz = props.selfTestQuiz || [];

  return (
    <div className="w-full my-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-100/60 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
            <p className="text-xs text-indigo-600 font-medium">AarikaBookLM Study Guide</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/50">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Grounded Guide
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200/60 pb-2 mb-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "summary"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
          }`}
        >
          Summary
        </button>
        {keyTerms.length > 0 && (
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "terms"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Key Terms ({keyTerms.length})
          </button>
        )}
        {coreConcepts.length > 0 && (
          <button
            onClick={() => setActiveTab("concepts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "concepts"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Core Concepts
          </button>
        )}
        {quiz.length > 0 && (
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Self-Test Quiz ({quiz.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="text-xs text-gray-700 leading-relaxed min-h-[120px]">
        {activeTab === "summary" && (
          <div className="p-4 rounded-xl bg-white/80 border border-gray-100 shadow-2xs">
            <p className="font-medium text-gray-800 text-sm mb-2">Overview</p>
            <p>{summary}</p>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="space-y-2.5">
            {keyTerms.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
                  <Key className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  {item.term}
                </div>
                <p className="text-gray-600 text-xs pl-5">{item.definition}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "concepts" && (
          <div className="space-y-3">
            {coreConcepts.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <h4 className="font-semibold text-gray-900 mb-1">{item.topic}</h4>
                <p className="text-gray-600">{item.notes}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="space-y-4">
            {quiz.map((q, qIdx) => (
              <div key={qIdx} className="p-3.5 rounded-xl bg-white border border-gray-100 shadow-2xs space-y-2">
                <div className="flex items-start gap-2 font-medium text-gray-800">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{qIdx + 1}. {q.question}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pt-1">
                  <button
                    onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qIdx]: "A" }))}
                    className={`p-2 rounded-lg border text-left font-medium transition-all ${
                      selectedAnswers[qIdx] === "A"
                        ? q.answer === "A"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    A) {q.optionA}
                  </button>
                  <button
                    onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qIdx]: "B" }))}
                    className={`p-2 rounded-lg border text-left font-medium transition-all ${
                      selectedAnswers[qIdx] === "B"
                        ? q.answer === "B"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    B) {q.optionB}
                  </button>
                </div>
                {selectedAnswers[qIdx] && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium pl-6 pt-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Correct Answer: {q.answer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGuideCard;
