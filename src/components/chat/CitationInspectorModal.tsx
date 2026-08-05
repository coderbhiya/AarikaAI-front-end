"use client";

import React from "react";
import { X, ExternalLink, FileText, Globe } from "lucide-react";

export interface CitationData {
  number: number;
  title: string;
  url?: string;
  snippet?: string;
  sourceType?: "web" | "document";
}

interface CitationInspectorModalProps {
  isOpen: boolean;
  citation: CitationData | null;
  onClose: () => void;
}

export const CitationInspectorModal: React.FC<CitationInspectorModalProps> = ({ isOpen, citation, onClose }) => {
  if (!isOpen || !citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-5 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
              [{citation.number}]
            </span>
            <h3 className="font-semibold text-gray-900 text-sm">Source Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            {citation.sourceType === "document" ? (
              <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            ) : (
              <Globe className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900 leading-snug">{citation.title}</h4>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline font-medium break-all"
                >
                  {citation.url} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              )}
            </div>
          </div>

          {citation.snippet && (
            <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100 text-gray-700">
              <p className="font-semibold text-amber-900 text-[11px] uppercase tracking-wider mb-1">Source Excerpt / Snippet</p>
              <p className="italic text-gray-600 leading-relaxed font-serif text-[12px]">"{citation.snippet}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitationInspectorModal;
