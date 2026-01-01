import React from "react";
import { useNavigate } from "react-router-dom";
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
  History,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const UpdatesFaq = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="flex items-center gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Knowledge Base</h1>
            <p className="text-gray-500 font-medium">System updates, technical logs, and frequent inquiries.</p>
          </div>
        </div>

        <div className="space-y-16">
          {/* Latest Updates */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Terminal size={20} />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">System Logs</h2>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-[2rem] p-8 border-white/[0.05] hover:border-primary/20 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Cpu size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">Neural Core Expansion</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 bg-white/5 px-3 py-1 rounded-full">Patch 8.5.0</span>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                  We've successfully deployed a new layer of context-aware neural weights. Communications now exhibit 40% higher contextual retention across long-form dialogues.
                </p>
              </div>

              <div className="glass-card rounded-[2rem] p-8 border-white/[0.05] hover:border-primary/20 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">Aesthetic Synchronization</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 bg-white/5 px-3 py-1 rounded-full">Patch 8.4.2</span>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                  The interface has undergone a complete visual overhaul to align with premium glassmorphic standards. Enhanced fluidity in transitions and refined typography.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Information Retrieval</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "How do I initiate a new session?",
                  a: "Access the 'Begin New Thread' trigger in your primary sidebar or utilize the global shortcut commands.",
                  icon: <MessageSquare size={16} />
                },
                {
                  q: "How is my data integrity maintained?",
                  a: "All packets are processed через industry-standard secure tunnels. No external nodes can access your private data stream.",
                  icon: <Shield size={16} />
                },
                {
                  q: "Can I purge historical logs?",
                  a: "Full data deletion is available via the 'System Purge' option in your navigation console.",
                  icon: <History size={16} />
                },
                {
                  q: "Is there a bandwidth limit?",
                  a: "Currently, all authorized entities have unlimited throughput. We monitor system load to ensure global stability.",
                  icon: <Info size={16} />
                }
              ].map((item, idx) => (
                <div key={idx} className="glass-card rounded-[2rem] p-6 border-white/[0.03] hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-primary">{item.icon}</div>
                    <h3 className="font-bold text-white text-sm">{item.q}</h3>
                  </div>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Support */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="p-10 rounded-[3rem] bg-primary relative overflow-hidden group shadow-2xl shadow-primary/20">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <LifeBuoy size={24} className="text-white" />
                    <h2 className="text-2xl font-black text-white tracking-tighter">Need Technical Support?</h2>
                  </div>
                  <p className="text-white/80 font-medium max-w-sm">
                    Our engineering team is standing by to resolve any system anomalies or architectural questions.
                  </p>
                </div>
                <button className="px-10 py-5 bg-white text-primary font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3">
                  <Mail size={16} /> Open Support Ticket
                </button>
              </div>
              <div className="absolute top-[-50%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UpdatesFaq;