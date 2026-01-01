import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  UserCheck,
  Zap,
  Gavel,
  XCircle,
  FileText,
  Globe,
  ArrowLeft,
  Calendar,
  ShieldAlert
} from "lucide-react";

const Termandconditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
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
            <Gavel size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Legal Framework v10.2</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 underline decoration-primary underline-offset-8">Neural Contract</h1>
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Calendar size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">Effective Cycle: 01 October 2025</span>
          </div>
        </div>

        <div className="w-full space-y-8">
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
                "All neural weights, codebases, and interface assets remain the property of Career AI.",
                "Unauthorized redistribution of proprietary intelligence is strictly prohibited."
              ]
            },
            {
              title: "Liability Constraints",
              icon: <ShieldAlert size={20} />,
              points: [
                "Career AI provides trajectory projections but does not guarantee specific placement.",
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
            <section key={idx} className="glass-card rounded-[2.5rem] p-10 border-white/[0.05] hover:border-primary/20 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic italic-none">{section.title}</h2>
              </div>
              <ul className="space-y-4">
                {section.points.map((p, i) => (
                  <li key={i} className="flex gap-4 items-start text-gray-400 font-medium leading-relaxed">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Agreement Section */}
          <div className="mt-16 flex flex-col items-center gap-8 py-16 px-10 rounded-[3rem] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
            <div className="relative z-10 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-8">Establish Neural Binding</p>
              <button
                onClick={() => navigate('/')}
                className="group/btn relative px-12 py-6 bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all overflow-hidden"
              >
                <span className="relative z-10">Acknowledge Framework</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Career AI • Legal Intelligence Core v10.2</p>
        </div>
      </div>
    </div>
  );
};

export default Termandconditions;
