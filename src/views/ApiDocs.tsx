"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  LogIn,
  UserPlus,
  Lock,
  Globe,
  Copy,
  ChevronRight,
  Terminal,
  Cpu,
  Search,
  ArrowRight,
  Zap,
  Menu,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

const SyntaxHighlighter = dynamic<any>(() => import("react-syntax-highlighter").then(mod => mod.Light), { ssr: false });

const mockApiData = [
  {
    category: "Authentication",
    icon: <Lock size={16} />,
    title: "Authentication Protocol",
    description: "Secure and manage entity access nodes using high-fidelity neural encryption keys.",
    baseUrl: "https://api.aarika.ai/v1/auth",
    auth: "Bearer JWT",
    endpoints: [
      {
        method: "POST",
        path: "/login",
        params: {
          body: ["email", "password"]
        },
        requestExample: {
          email: "entity@aarika.ai",
          password: "••••••••"
        },
        responseExample: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          expiresIn: 3600
        }
      }
    ]
  },
  {
    category: "Profiles",
    icon: <Cpu size={16} />,
    title: "Neural Profile Engine",
    description: "Access and synchronize career intelligence matrices across global compute nodes.",
    baseUrl: "https://api.aarika.ai/v1/profiles",
    auth: "Bearer JWT",
    endpoints: [
      {
        method: "GET",
        path: "/sync",
        params: {
          query: ["node_id"]
        },
        requestExample: {},
        responseExample: {
          node: {
            id: "neuro_99x",
            alias: "Lead Strategist",
            vector: [0.88, 0.42, 0.91]
          }
        }
      }
    ]
  }
];

const ApiDocs = () => {
  const { toggleSidebar } = useAuth();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const [selectedApi, setSelectedApi] = useState(mockApiData[0]);

  useEffect(() => {
    import("react-syntax-highlighter/dist/esm/languages/hljs/json").then(json => {
      import("react-syntax-highlighter").then(mod => {
        mod.Light.registerLanguage("json", json.default);
      });
    });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Packet coordinates copied to clipboard");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white text-slate-900 relative overflow-hidden selection:bg-primary/20">
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
            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">API Interface</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Sidebar - Liquid Glass Sidebar */}
      <aside className="w-68 bg-white border-r border-slate-100 p-6 overflow-y-auto hidden lg:block relative z-20">
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate.push("/chat")}>
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg transition-transform duration-500">
            <Terminal size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold tracking-tight uppercase leading-none text-slate-900">Console</h2>
            <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-70">v9.4 Stable</span>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
          <input
            type="text"
            placeholder="Search architecture..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-[8px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/30 focus:bg-white transition-all duration-500 placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-10">
          <div>
            <h3 className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2 opacity-70">Logical Domains</h3>
            <ul className="space-y-1.5">
              {mockApiData.map((api) => (
                <li
                  key={api.category}
                  className={cn(
                    "group cursor-pointer flex items-center justify-between p-3 rounded-xl transition-all duration-500 border",
                    selectedApi.category === api.category
                      ? "bg-slate-900 border-slate-900 text-white shadow-md scale-[1.01]"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  onClick={() => setSelectedApi(api)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500",
                      selectedApi.category === api.category ? "bg-white/10 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                    )}>
                      {api.icon}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{api.category}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-[8px] font-bold text-slate-900 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Status: Operational
              </h4>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Global sync index 99.98%.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto relative z-10 scrollbar-none">
        <div className="max-w-5xl mx-auto">
          {/* Top Nav */}
          <nav className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-6">
              <button className="text-[8px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all">Manuals</button>
              <button className="text-[8px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all">Environment</button>
              <button className="text-[8px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all">Architecture</button>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold uppercase tracking-widest text-[8px] transition-all hover:bg-primary active:scale-95 shadow-md">
                Synchronize
              </button>
              <button className="bg-white border border-slate-100 px-5 py-2 rounded-lg font-bold uppercase tracking-widest text-[8px] transition-all hover:border-primary/20 text-slate-400 hover:text-slate-900 active:scale-95">
                Keys
              </button>
            </div>
          </nav>

          {/* API Info */}
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6 text-primary">
               <div className="p-2 bg-primary/5 rounded-lg">
                  {selectedApi.icon}
               </div>
               <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">{selectedApi.category} Core</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">{selectedApi.title}</h1>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-10 opacity-70">{selectedApi.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-center justify-between group hover:shadow-md transition-all duration-500">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-70">Primary Node</p>
                  <p className="text-[12px] font-bold text-slate-900 font-mono tracking-tight">{selectedApi.baseUrl}</p>
                </div>
                <button onClick={() => copyToClipboard(selectedApi.baseUrl)} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-300 hover:text-primary transition-all duration-500">
                  <Copy size={14} />
                </button>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-center justify-between group hover:shadow-md transition-all duration-500">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-70">Protocol Model</p>
                  <p className="text-[12px] font-bold text-slate-900 font-mono tracking-tight">{selectedApi.auth}</p>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-300">
                   <Lock size={14} />
                </div>
              </div>
            </div>
          </section>

          {/* Endpoints */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest italic">Neural Probes</h2>
              <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest opacity-60">{selectedApi.endpoints.length} Active Method</div>
            </div>

            <div className="space-y-16">
              {selectedApi.endpoints.map((endpoint, index) => (
                <div key={index} className="space-y-8 group">
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border group-hover:scale-105 transition-transform duration-500 shadow-sm",
                      endpoint.method === "GET"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-blue-50 border-blue-100 text-blue-600"
                    )}>
                      {endpoint.method}
                    </span>
                    <span className="text-xl font-bold text-slate-900 tracking-wider font-mono">{endpoint.path}</span>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Documentation View */}
                    <div className="space-y-6">
                      {endpoint.params && (
                        <div>
                          <h4 className="text-[8px] font-bold text-primary uppercase tracking-widest mb-4 ml-1 opacity-70">Parameter Matrix</h4>
                          <div className="space-y-3">
                            {Object.entries(endpoint.params).map(([type, keys]) => (
                              <div key={type} className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-500">
                                <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-3 italic">Request.{type}</div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(keys) && keys.map(k => (
                                    <span key={k} className="text-[8px] font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-sm">{k}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group/btn">
                        <div className="relative z-10">
                           <div className="flex items-center gap-2 mb-2 text-primary">
                             <Zap size={14} className="animate-pulse" />
                             <span className="text-[8px] font-bold uppercase tracking-widest">Optimization Tip</span>
                           </div>
                           <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-sm">
                             Ensure neural identification is synchronized before broadcast. Packet loss may occur during deep-node diagnostic cycles.
                           </p>
                        </div>
                      </div>
                    </div>

                    {/* Code Examples */}
                    <div className="space-y-4">
                      <div className="relative group/code animate-in zoom-in-95 duration-700">
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5">
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white/80 border border-slate-100 px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-sm">Payload.JSON</div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.requestExample, null, 2))}
                            className="p-1.5 bg-white border border-slate-100 text-slate-300 hover:text-primary rounded-lg transition-all duration-500 shadow-sm hover:scale-110 active:scale-95"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <SyntaxHighlighter
                          language="json"
                          style={atomOneLight}
                          customStyle={{ background: '#f8faff', border: '1px solid #f1f5f9', borderRadius: '1.5rem', padding: '2rem', fontSize: '12px', lineHeight: '1.6' }}
                        >
                          {JSON.stringify(endpoint.requestExample, null, 2)}
                        </SyntaxHighlighter>
                      </div>

                      <div className="relative group/code animate-in zoom-in-95 duration-700 delay-100">
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5">
                          <div className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/80 border border-emerald-100 px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-sm">Status.200_OK</div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.responseExample, null, 2))}
                            className="p-1.5 bg-white border border-slate-100 text-slate-300 hover:text-primary rounded-lg transition-all duration-500 shadow-sm hover:scale-110 active:scale-95"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <SyntaxHighlighter
                          language="json"
                          style={atomOneLight}
                          customStyle={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1.5rem', padding: '2rem', fontSize: '12px', lineHeight: '1.6', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}
                        >
                          {JSON.stringify(endpoint.responseExample, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Identifier */}
          <div className="mt-24 pt-12 border-t border-slate-100 flex items-center justify-center opacity-30">
             <p className="text-[10px] font-bold uppercase tracking-[0.8em] text-slate-400 italic">Distributive Intelligence Architecture • Node Stable</p>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default ApiDocs;
