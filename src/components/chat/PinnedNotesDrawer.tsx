"use client";

import React, { useState } from "react";
import { X, Bookmark, Copy, Trash2, Download, Search, Check } from "lucide-react";

export interface PinnedNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface PinnedNotesDrawerProps {
  isOpen: boolean;
  notes: PinnedNote[];
  onClose: () => void;
  onDeleteNote: (id: string) => void;
}

export const PinnedNotesDrawer: React.FC<PinnedNotesDrawerProps> = ({ isOpen, notes, onClose, onDeleteNote }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredNotes = notes.filter(
    (n) => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    const exportText = notes.map((n) => `# ${n.title}\n\n${n.content}\n\n---`).join("\n\n");
    const blob = new Blob([exportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aarika_pinned_notes_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-5 border-l border-gray-100 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">My Pinned Notes</h3>
              <p className="text-xs text-gray-500">{notes.length} Pinned Study Snippets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          {notes.length > 0 && (
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-xl hover:bg-amber-100 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Export .md
            </button>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No pinned notes found.</p>
              <p className="text-[11px] text-gray-400 mt-1">Pin important responses in chat to save them here!</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl border border-gray-200/80 bg-white shadow-2xs space-y-2 hover:border-amber-200 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 text-xs">{note.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(note.id, note.content)}
                      className="p-1 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Copy content"
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{note.content}</p>
                <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                  {note.createdAt}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedNotesDrawer;
