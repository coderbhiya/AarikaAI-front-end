"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Newspaper,
  HelpCircle,
  LifeBuoy,
  Mail,
  Info,
  Terminal,
  Cpu,
  Shield,
  MessageSquare,
  Sparkles,
  Menu,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const UpdatesFaq = () => {
  const { toggleSidebar } = useAuth();
  const navigate = useRouter();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-screen w-full bg-white relative overflow-hidden selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100/50 w-full">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Menu size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">System Logs</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-0 pt-0 pb-20">
        <div className="relative z-10 max-w-5xl mx-auto py-8 md:py-12">
          {/* Internal Navigation/Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-700 ease-out px-6">
            <button
              onClick={() => navigate.back()}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all w-fit"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-[8px] mb-1.5 block opacity-70">Repository Library</span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-none">System Intelligence Logs</h1>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2 opacity-70">Neural updates, technical nodes, and protocol inquiries.</p>
            </div>
          </div>

        <div className="space-y-32">
          {/* Latest Updates - System Logs Section */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                <Terminal size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest italic">Diagnostic Logs</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-primary/20 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center justify-between gap-6 mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                      <Cpu size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">Neural Core v9.4</h3>
                  </div>
                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Live Optimization</span>
                </div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed relative z-10 opacity-70">
                  Successfully deployed high-fidelity neural weight sets. Communications now exhibit 45% higher contextual fidelity across deep-dialogue assessment threads.
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-primary/20 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center justify-between gap-6 mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">Gemini Era Sync</h3>
                  </div>
                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Visual Patch</span>
                </div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed relative z-10 opacity-70">
                  Complete platform architectural shift to Gemini Era standards. Liquid glass transitions, high-translucency layers, and redefined slate-900 typography.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ - Information Retrieval */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
                <HelpCircle size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest italic">Architecture Query</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "How to trigger neural synchronization?",
                  a: "Initiate 'Binary Link' protocols via the primary node.",
                  icon: <MessageSquare size={14} />
                },
                {
                  q: "Security model for data packets?",
                  a: "Neural tunnels ensure all private data streams remain local.",
                  icon: <Shield size={14} />
                },
                {
                  q: "Historical log purging methods?",
                  a: "Full wipes available via the 'System Zero' protocol.",
                  icon: <History size={14} />
                },
                {
                  q: "Throughput limitations?",
                  a: "Unlimited bandwidth allocation for all authorized entities.",
                  icon: <Info size={14} />
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-6 hover:bg-slate-50 transition-all duration-500 group shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-primary opacity-60">{item.icon}</div>
                    <h3 className="font-bold text-slate-900 text-[11px] tracking-widest uppercase">{item.q}</h3>
                  </div>
                  <p className="text-slate-400 text-[9px] font-bold leading-relaxed uppercase tracking-widest italic flex items-center gap-2 opacity-70">
                    <ArrowLeft size={10} className="rotate-180" /> {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Support Node - Proactive Support */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-10 md:p-16 rounded-2xl bg-slate-900 relative overflow-hidden group shadow-lg transition-all duration-1000">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full translate-x-32 -translate-y-32 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <LifeBuoy size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Technical Anomaly?</h2>
                  </div>
                  <p className="text-slate-400 font-bold text-[11px] max-w-sm uppercase tracking-widest leading-relaxed opacity-80">
                    Our engineering collective is synchronized to resolve any architectural defects or system synchronization failures.
                  </p>
                </div>
                <button className="px-10 py-4 bg-white text-slate-900 font-bold uppercase tracking-widest text-[9px] rounded-xl hover:bg-primary hover:text-white transition-all duration-500 flex items-center gap-3 shadow-2xl active:scale-95">
                  <Mail size={14} /> Establish Support Link
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Identifier */}
        <div className="mt-24 pt-8 border-t border-slate-50 flex items-center justify-center opacity-30">
           <p className="text-[8px] font-bold uppercase tracking-[0.6em] text-slate-400 italic">Integrated Knowledge Graph • v9.4 Stable</p>
        </div>
      </div>
    </div>
  </div>
);
};

export default UpdatesFaq;