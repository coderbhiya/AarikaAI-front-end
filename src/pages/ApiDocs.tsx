import React, { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  Menu,
  LogIn,
  UserPlus,
  Code2,
  BookOpen,
  Layers,
  Zap,
  Lock,
  Globe,
  Server,
  Copy,
  ChevronRight,
  Terminal,
  Activity,
  Cpu,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

SyntaxHighlighter.registerLanguage("json", json);

const mockApiData = [
  {
    category: "Authentication",
    icon: <Lock size={18} />,
    title: "Authentication Protocol",
    description: "Manage secure access to entity nodes using neural keys.",
    baseUrl: "https://api.careerai.sh/v1/auth",
    auth: "Bearer JWT",
    endpoints: [
      {
        method: "POST",
        path: "/login",
        params: {
          body: ["email", "password"]
        },
        requestExample: {
          email: "entity@careerai.sh",
          password: "********"
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
    icon: <Cpu size={18} />,
    title: "Neural Profile API",
    description: "Access and synchronize career intelligence profiles.",
    baseUrl: "https://api.careerai.sh/v1/profiles",
    auth: "Bearer JWT",
    endpoints: [
      {
        method: "GET",
        path: "/fetch",
        params: {
          query: ["id"]
        },
        requestExample: {},
        responseExample: {
          profile: {
            id: "node_772",
            alias: "Senior Architect",
            capabilities: ["Rust", "WASM", "Neural Networks"]
          }
        }
      }
    ]
  },
  {
    category: "Diagnostics",
    icon: <Activity size={18} />,
    title: "System Diagnostics API",
    description: "Monitor real-time system performance and neural health.",
    baseUrl: "https://api.careerai.sh/v1/status",
    auth: "None",
    endpoints: [
      {
        method: "GET",
        path: "/health",
        params: {
          query: []
        },
        requestExample: {},
        responseExample: {
          status: "synchronized",
          load: "0.22",
          uptime: "1.2M seconds"
        }
      }
    ]
  }
];

const ApiDocs = () => {
  const [selectedApi, setSelectedApi] = useState(mockApiData[0]);

  useEffect(() => {
    setSelectedApi(mockApiData[0]);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Coordinates copied to clipboard");
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-80 bg-black/40 backdrop-blur-3xl border-r border-white/5 p-8 overflow-y-auto hidden lg:block relative z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Terminal size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic">DevConsole</h2>
        </div>

        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Interface Groups</h3>
            <ul className="space-y-3">
              {mockApiData.map((api) => (
                <li
                  key={api.category}
                  className={cn(
                    "group cursor-pointer flex items-center justify-between p-4 rounded-2xl transition-all border",
                    selectedApi.category === api.category
                      ? "bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/5"
                      : "bg-transparent border-transparent text-gray-500 hover:bg-white/[0.03] hover:text-white"
                  )}
                  onClick={() => setSelectedApi(api)}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "transition-colors",
                      selectedApi.category === api.category ? "text-primary" : "text-gray-600 group-hover:text-gray-400"
                    )}>
                      {api.icon}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest">{api.category}</span>
                  </div>
                  {selectedApi.category === api.category && <ChevronRight size={14} />}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
              <Server size={12} className="text-primary" /> Status: Live
            </h4>
            <p className="text-[10px] font-bold text-gray-600 leading-relaxed uppercase tracking-widest">Global nodes functioning at 99.9% optimization.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Top Nav */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-8">
              <button className="text-xs font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-all">Documentation</button>
              <button className="text-xs font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-all">Playground</button>
              <button className="text-xs font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-all">Support</button>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-white text-black px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl shadow-white/5">
                Login
              </button>
              <button className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white/10 active:scale-95">
                Developer Keys
              </button>
            </div>
          </nav>

          {/* API Info */}
          <section className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6 text-primary">
              {selectedApi.icon}
              <span className="text-[12px] font-black uppercase tracking-[0.3em]">{selectedApi.category}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">{selectedApi.title}</h1>
            <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-2xl mb-10">{selectedApi.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-6 border-white/[0.05] flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Base Endpoint</p>
                  <p className="text-sm font-bold text-white font-mono">{selectedApi.baseUrl}</p>
                </div>
                <button onClick={() => copyToClipboard(selectedApi.baseUrl)} className="p-2 text-gray-600 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                  <Copy size={16} />
                </button>
              </div>
              <div className="glass-card rounded-2xl p-6 border-white/[0.05] flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Security Model</p>
                  <p className="text-sm font-bold text-white font-mono">{selectedApi.auth}</p>
                </div>
                <Lock size={16} className="text-gray-600" />
              </div>
            </div>
          </section>

          {/* Endpoints */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Access Methods</h2>
              <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">{selectedApi.endpoints.length} Endpoint identified</div>
            </div>

            <div className="space-y-12">
              {selectedApi.endpoints.map((endpoint, index) => (
                <div key={index} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-lg",
                      endpoint.method === "GET"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/5"
                    )}>
                      {endpoint.method}
                    </span>
                    <span className="text-xl font-black text-white tracking-widest">{endpoint.path}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Documentation View */}
                    <div className="space-y-6">
                      {endpoint.params && (
                        <div>
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Parameter Matrix</h4>
                          <div className="space-y-3">
                            {Object.entries(endpoint.params).map(([type, keys]) => (
                              <div key={type} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Payload.{type}</div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(keys) && keys.map(k => (
                                    <span key={k} className="text-[10px] font-bold text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">{k}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-3 text-primary">
                          <Zap size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pro Tip</span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                          Always ensure the entity token is active before initiating high-bandwidth diagnostic calls.
                        </p>
                      </div>
                    </div>

                    {/* Code Examples */}
                    <div className="space-y-6">
                      <div className="relative group">
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                          <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">REQUEST.JSON</div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.requestExample, null, 2))}
                            className="p-1.5 bg-black/50 text-gray-500 hover:text-white rounded-md backdrop-blur-sm transition-all"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <SyntaxHighlighter
                          language="json"
                          style={atomOneDark}
                          customStyle={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '2rem' }}
                        >
                          {JSON.stringify(endpoint.requestExample, null, 2)}
                        </SyntaxHighlighter>
                      </div>

                      <div className="relative group">
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                          <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md backdrop-blur-sm">STATUS_OK: 200</div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.responseExample, null, 2))}
                            className="p-1.5 bg-black/50 text-gray-500 hover:text-white rounded-md backdrop-blur-sm transition-all"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <SyntaxHighlighter
                          language="json"
                          style={atomOneDark}
                          customStyle={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '1.5rem', padding: '2rem' }}
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
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;
