"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Shared column for feature pages (Job Agent, Mock Interview, ...). The header row
 * and the page body use the same max width and side padding, so the title, the
 * cards and the right-hand actions all line up — and they sit in the same place
 * when you switch between pages.
 */
export const PAGE_COLUMN = "w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8";

export function PageHeader({ icon, title, actions }: { icon: React.ReactNode; title: string; actions?: React.ReactNode }) {
  const { toggleSidebar } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 w-full shadow-sm">
      <div className={`${PAGE_COLUMN} h-14 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 min-w-0">
          {/* -ml-2 cancels the button's padding so the icon itself meets the column edge. */}
          <button
            onClick={toggleSidebar}
            className="-ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-primary shrink-0 [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
          <h2 className="font-bold text-gray-900 text-sm md:text-base truncate">{title}</h2>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0 -mr-2">{actions}</div>}
      </div>
    </header>
  );
}
