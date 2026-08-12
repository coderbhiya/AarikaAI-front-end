"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Search,
  Sparkles,
  Building2,
  FileText,
  GraduationCap,
  BarChart3,
  MapPin,
  BookOpen,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Compass,
  Layers,
  Bot,
  Menu,
  User,
} from "lucide-react";
import BrainLogo from "@/components/BrainLogo";
import Sidebar from "@/components/Sidebar";
import { AI_TOOLS } from "@/lib/tools";
import { AITool } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const toolIconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-6 h-6 text-blue-500" />,
  FileText: <FileText className="w-6 h-6 text-emerald-500" />,
  GraduationCap: <GraduationCap className="w-6 h-6 text-purple-500" />,
  BarChart3: <BarChart3 className="w-6 h-6 text-amber-500" />,
  MapPin: <MapPin className="w-6 h-6 text-rose-500" />,
  BookOpen: <BookOpen className="w-6 h-6 text-cyan-500" />,
};

const toolGradientMap: Record<string, string> = {
  campus_prep: "from-blue-600/10 via-indigo-600/5 to-transparent border-blue-500/20 text-blue-600",
  resume_generator: "from-emerald-600/10 via-teal-600/5 to-transparent border-emerald-500/20 text-emerald-600",
  exam_simulator: "from-purple-600/10 via-indigo-600/5 to-transparent border-purple-500/20 text-purple-600",
  skill_swot: "from-amber-600/10 via-orange-600/5 to-transparent border-amber-500/20 text-amber-600",
  career_roadmap: "from-rose-600/10 via-pink-600/5 to-transparent border-rose-500/20 text-rose-600",
  study_guide: "from-cyan-600/10 via-blue-600/5 to-transparent border-cyan-500/20 text-cyan-600",
};

const toolBgBadgeMap: Record<string, string> = {
  campus_prep: "bg-blue-500/10 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border-blue-200/80",
  resume_generator: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200/80",
  exam_simulator: "bg-purple-500/10 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border-purple-200/80",
  skill_swot: "bg-amber-500/10 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border-amber-200/80",
  career_roadmap: "bg-rose-500/10 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border-rose-200/80",
  study_guide: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 border-cyan-200/80",
};

const CATEGORIES = [
  { id: "all", label: "All AI Tools", icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "campus", label: "Placement Prep", icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: "resume", label: "Resume & ATS", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "exam", label: "Exam Simulator", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: "analytics", label: "Skill & SWOT", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "career", label: "Career Roadmap", icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: "study", label: "Study Guides", icon: <BookOpen className="w-3.5 h-3.5" /> },
];

export default function ToolsPage() {
  const router = useRouter();
  const { toggleSidebar } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTools = useMemo(() => {
    return AI_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        (tool.samplePrompts && tool.samplePrompts.some((p) => p.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleLaunchTool = (toolId: string, promptText?: string) => {
    let url = `/chat?tool=${toolId}`;
    if (promptText) {
      url += `&prompt=${encodeURIComponent(promptText)}`;
    }
    router.push(url);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <React.Suspense fallback={<div className="w-64 border-r border-border/50 bg-background/95 h-full"></div>}>
        <Sidebar />
      </React.Suspense>

      {/* Main Tools Showcase Page Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-none bg-muted/20 relative">
        
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-background/80 backdrop-blur-xl border-b border-border/60 w-full">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
              title="Toggle Sidebar"
            >
              <Menu size={18} className="md:w-5 md:h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[16px] sm:text-[17px] font-semibold text-[#444746] tracking-tight flex items-center gap-1.5">
                <span>AI Tools</span>
                <span className="text-[9.5px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                  Catalogue
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm shrink-0" 
              onClick={() => router.push("/profile")}
            >
              <User size={16} />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Explore ChatGPT-Style AI Feature Engines</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              What would you like to achieve today?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select an AI tool below to start an interactive session tailored specifically to your goal—from TCS NQT placement mocks to instant ATS resume building.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto pt-2">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, exam (TCS, JEE), resume, or skill..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-background border border-border/80 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-lg shadow-black/5 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none pb-2 pt-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                      : "bg-background border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Featured Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>Featured Tools & AI Copilots</span>
                <span className="text-xs text-muted-foreground font-normal">({filteredTools.length} Available)</span>
              </h3>
            </div>
          </div>

          {/* Tools Grid Showcase */}
          {filteredTools.length === 0 ? (
            <div className="p-12 text-center bg-background border border-border/80 rounded-3xl shadow-sm space-y-3">
              <Wrench className="w-10 h-10 text-muted-foreground mx-auto" />
              <h4 className="text-base font-bold text-foreground">No matching AI tools found</h4>
              <p className="text-xs text-muted-foreground">Try clearing your search query or selecting a different category.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                const gradientClass = toolGradientMap[tool.id] || "from-primary/10 to-transparent border-primary/20 text-primary";
                const badgeClass = toolBgBadgeMap[tool.id] || "bg-primary/10 text-primary border-primary/20";

                return (
                  <div
                    key={tool.id}
                    className="group bg-background border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Subtle Card Background Accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientClass} rounded-bl-full pointer-events-none opacity-60 transition-opacity group-hover:opacity-100`} />

                    <div className="space-y-4 z-10">
                      {/* Top Row: Icon & Badge */}
                      <div className="flex items-start justify-between">
                        <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/80 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                          {toolIconMap[tool.icon] || <Wrench className="w-6 h-6 text-primary" />}
                        </div>
                        {tool.badge && (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                            {tool.badge}
                          </span>
                        )}
                      </div>

                      {/* Tool Title & Subtitle */}
                      <div>
                        <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{tool.name}</span>
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>

                      {/* Sample Prompts List */}
                      {tool.samplePrompts && tool.samplePrompts.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-border/60">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" /> Click to launch prompt:
                          </span>
                          <div className="space-y-1.5">
                            {tool.samplePrompts.map((prompt, pIdx) => (
                              <button
                                key={pIdx}
                                onClick={() => handleLaunchTool(tool.id, prompt)}
                                className="w-full text-left p-2 rounded-xl bg-muted/40 hover:bg-primary/10 border border-border/60 hover:border-primary/30 text-[11px] text-foreground/90 hover:text-primary transition-all flex items-center justify-between group/prompt"
                              >
                                <span className="truncate pr-2 font-medium">{prompt}</span>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover/prompt:opacity-100 transition-opacity text-primary" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-5 mt-4 border-t border-border/60 z-10">
                      <button
                        onClick={() => handleLaunchTool(tool.id)}
                        className="w-full py-3 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs group-hover:shadow-md group-hover:shadow-primary/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Use {tool.shortName}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
            <div className="space-y-2 max-w-xl z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Enterprise Placement Intelligence
              </div>
              <h3 className="text-xl font-bold text-white">Need custom company assessment prep?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                AarikaAI dynamically fetches real company test patterns for TCS, Infosys, Wipro, Accenture, Google, and Amazon.
              </p>
            </div>
            <button
              onClick={() => handleLaunchTool("campus_prep")}
              className="px-6 py-3 bg-white text-slate-900 font-extrabold text-xs rounded-xl shadow-lg hover:bg-blue-50 transition-all z-10 flex items-center gap-2 shrink-0"
            >
              <span>Launch Placement Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
