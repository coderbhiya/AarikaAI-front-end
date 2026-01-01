import React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        {/* Header Navigation */}
        <div className="w-full flex justify-start mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Return
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Protocol 8.5</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 italic italic-none">Privacy Directive</h1>
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Calendar size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">Effective Cycle: 01 October 2025</span>
          </div>
        </div>

        <div className="w-full space-y-8">
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
                "Career AI does not authorize the liquidation of private data streams.",
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
            <section key={idx} className="glass-card rounded-[2.5rem] p-10 border-white/[0.05] hover:border-primary/20 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic italic-none">{section.title}</h2>
              </div>
              <ul className="space-y-4">
                {section.content.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start text-gray-400 font-medium leading-relaxed">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Contact Section */}
          <section className="glass-card rounded-[3rem] p-12 md:p-16 border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 italic italic-none">Communication Request</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a href="mailto:dave@senseforge.in" className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] hover:border-primary/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Electronic Mail</p>
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">dave@senseforge.in</p>
                </div>
              </a>
              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                  <MapPin size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Entity Base</p>
                  <p className="text-sm font-bold text-white uppercase tracking-widest">Senseforge HQ • India</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-20 text-center">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Career AI • All Data Encrypted via Neural Tunnels</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
