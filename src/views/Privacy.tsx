"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  Share2,
  Lock,
  Mail,
  MapPin,
  ArrowLeft,
  Calendar,
  Info
} from "lucide-react";

const Privacy = () => {
  const navigate = useRouter();

  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden p-6 md:p-12 selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-12 md:py-16 flex flex-col items-center">
        {/* Header Navigation */}
        <div className="w-full flex justify-start mb-16 animate-in fade-in slide-in-from-left-4 duration-700">
          <button
            onClick={() => navigate.back()}
            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Return Node
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary mb-6 shadow-sm">
            <ShieldCheck size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Security Protocol 8.5</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 uppercase">Privacy Directive.</h1>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <Calendar size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Cycle: 2025.10.01</span>
          </div>
        </div>

        <div className="w-full space-y-6">
          {[
            {
              title: "Information Acquisition",
              icon: <Eye size={20} />,
              content: [
                "Personal Identifiers: Legal Name, encrypted email, verified phone numbers.",
                "Diagnostic Logs: Interaction patterns, neural preferences, architectural versioning.",
                "External Assets: Resumes, certifications, and auxiliary professional datasets."
              ]
            },
            {
              title: "Utilization Matrix",
              icon: <Info size={20} />,
              content: [
                "To synthesize highly accurate career trajectories and skill indexing.",
                "To optimize system throughput and entity-specific response calibration.",
                "To broadcast critical system updates or localized career opportunities."
              ]
            },
            {
              title: "Data Transmission",
              icon: <Share2 size={20} />,
              content: [
                "Aarika AI does not authorize the liquidation of private data streams.",
                "Transmissions are limited to verified cloud nodes for core functionality.",
                "Compulsory disclosures strictly limited to legal or regulatory mandates."
              ]
            },
            {
              title: "Entity Authority",
              icon: <Lock size={20} />,
              content: [
                "You maintain total command over your private data packets.",
                "Request purging or correction via the designated support nodes.",
                "Neural links can be decoupled at any cycle by the entity."
              ]
            }
          ].map((section, idx) => (
            <section key={idx} className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{section.title}</h2>
              </div>
              <ul className="space-y-5">
                {section.content.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start text-slate-500 font-bold text-[13px] uppercase tracking-widest opacity-80 leading-relaxed">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Contact Section */}
          <section className="bg-slate-50 rounded-2xl p-10 md:p-12 border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden relative">
            <div className="relative z-10">
               <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-10">Communication Request</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <a href="mailto:support@aarika.ai" className="flex items-center gap-5 p-6 rounded-xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-500 group">
                   <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center text-primary shadow-sm">
                     <Mail size={20} />
                   </div>
                   <div className="text-left">
                     <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mb-1 leading-none">Electronic Mail</p>
                     <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">support@aarika.ai</p>
                   </div>
                 </a>
                 <div className="flex items-center gap-5 p-6 rounded-xl bg-white border border-slate-100 transition-all duration-500 hover:shadow-lg group">
                   <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-900 shadow-sm">
                     <MapPin size={20} />
                   </div>
                   <div className="text-left">
                     <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mb-1 leading-none">Entity Base</p>
                     <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Senseforge HQ • India</p>
                   </div>
                 </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
          </section>
        </div>

        <div className="mt-20 text-center opacity-30">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.6em]">Aarika AI • Encrypted via Neural Tunnels • v9.4</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
