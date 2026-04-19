"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  UserCheck,
  Zap,
  Gavel,
  XCircle,
  Globe,
  ArrowLeft,
  Calendar,
  ShieldAlert
} from "lucide-react";

const Termandconditions = () => {
  const navigate = useRouter();

  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden p-6 md:p-12 selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
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
            <Gavel size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Legal Framework v10.2</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 uppercase">Neural Contract.</h1>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <Calendar size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Cycle: 2025.10.01</span>
          </div>
        </div>

        <div className="w-full space-y-6">
          {[
            {
              title: "Eligibility Criteria",
              icon: <UserCheck size={20} />,
              points: [
                "Entity must be at least 16 orbital cycles old to initiate link.",
                "Entities under 18 require authorized parental node synchronization."
              ]
            },
            {
              title: "Operational Protocols",
              icon: <Zap size={20} />,
              points: [
                "Entities agree not to compromise individual nodes or engage in illicit data loops.",
                "Account credential integrity is the sole responsibility of the entity."
              ]
            },
            {
              title: "Proprietary Architecture",
              icon: <Scale size={20} />,
              points: [
                "All neural weights, codebases, and interface assets remain the property of Aarika AI.",
                "Unauthorized redistribution of proprietary intelligence is strictly prohibited."
              ]
            },
            {
              title: "Liability Constraints",
              icon: <ShieldAlert size={20} />,
              points: [
                "Aarika AI provides trajectory projections but does not guarantee specific placement.",
                "System utilization remains at the entity's own risk environment."
              ]
            },
            {
              title: "Link Termination",
              icon: <XCircle size={20} />,
              points: [
                "We reserve authority to decouple nodes if framework protocols are violated."
              ]
            },
            {
              title: "Judicial Jurisdiction",
              icon: <Globe size={20} />,
              points: [
                "All contractual disputes governed by the laws of India node."
              ]
            }
          ].map((section, idx) => (
            <section key={idx} className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Vector {idx + 1}. {section.title}</h2>
              </div>
              <ul className="space-y-5">
                {section.points.map((p, i) => (
                  <li key={i} className="flex gap-4 items-start text-slate-500 font-bold text-[13px] uppercase tracking-widest opacity-80 leading-relaxed">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Agreement Section */}
          <div className="mt-16 flex flex-col items-center gap-10 py-16 px-10 rounded-2xl bg-slate-900 relative overflow-hidden group shadow-2xl transition-all duration-1000">
            <div className="relative z-10 text-center">
              <span className="text-primary font-bold uppercase tracking-widest text-[8px] mb-4 block opacity-70">Consensus Required</span>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-8">Establish binding linkage?</h2>
              <button
                onClick={() => navigate.push('/')}
                className="group/btn relative px-12 py-5 bg-white text-slate-900 font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xl hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all duration-700 overflow-hidden"
              >
                <span className="relative z-10">Acknowledge Framework</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-white/20 to-primary translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-[2000ms]" />
          </div>
        </div>

        <div className="mt-20 text-center opacity-30">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.6em]">Aarika AI • Legal Neural Core v10.2 • Verified</p>
        </div>
      </div>
    </div>
  );
};

export default Termandconditions;
