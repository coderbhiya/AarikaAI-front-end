"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  Home,
  Compass,
  ArrowLeft,
  ShieldAlert,
  Search
} from "lucide-react";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      "Neural Link Failure: User attempted to access non-existent coordinate:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center p-6 selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[-5%] left-[-5%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center animate-in fade-in zoom-in-95 duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
        {/* Error Visual - Liquid Glass */}
        <div className="relative inline-block mb-12">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative w-32 h-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-primary shadow-2xl group overflow-hidden">
            <Compass size={56} className="animate-spin-slow group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
          </div>
        </div>

        {/* Text Layer */}
        <div className="space-y-6 mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-red-50 border border-red-100 text-red-500 shadow-sm animate-bounce">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Fault 404</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-none drop-shadow-sm">
            Neural link <br/>
            <span className="text-primary not-italic">Severed.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm mx-auto">
            The coordinates <code className="text-primary bg-primary/5 px-2 py-0.5 rounded-lg font-black">{pathname}</code> do not exist within our current neural architecture.
          </p>
        </div>

        {/* Actions - Premium Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            href="/"
            className="px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:bg-primary active:scale-95 transition-all duration-700 flex items-center justify-center gap-3 group"
          >
            <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Re-establish Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-10 py-5 glass-button border border-slate-100 text-slate-400 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:text-slate-900 transition-all duration-700 flex items-center justify-center gap-3"
          >
            <ArrowLeft size={18} /> Return to Last Node
          </button>
        </div>

        {/* Scanning Info */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-center gap-5 text-slate-300">
          <div className="flex items-center gap-3 italic">
            <Search size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Scanning for compatible routes...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
