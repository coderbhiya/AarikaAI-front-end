"use client";

import React, { useEffect, useRef, useState } from "react";
import { Copy, Check, Maximize2, X, GitBranch, Network, ArrowRightLeft, Calendar, PieChart, Database, Layers, Activity, Clock, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface DiagramCardProps {
  type?: string;
  title?: string;
  mermaid: string;
}

const TYPE_LABEL: Record<string, string> = {
  flowchart: "Flowchart", mindmap: "Mind Map", sequence: "Sequence",
  gantt: "Gantt", pie: "Pie Chart", er: "ER Diagram",
  classdiagram: "Class Diagram", statediagram: "State Diagram", timeline: "Timeline",
};

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  flowchart:    { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  mindmap:      { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" },
  sequence:     { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  gantt:        { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  pie:          { bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  er:           { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" },
  classdiagram: { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  statediagram: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
  timeline:     { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
};

let _cnt = 0;
let _mermaidReady = false;

async function getMermaid() {
  const mod = await import("mermaid");
  const m = mod.default;
  if (!_mermaidReady) {
    m.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: "linear",
        nodeSpacing: 50,
        rankSpacing: 55,
      },
      themeVariables: {
        darkMode: true,
        background: "#111827",
        primaryColor: "#4f46e5",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#6366f1",
        lineColor: "#94a3b8",
        secondaryColor: "#0f766e",
        tertiaryColor: "#1e293b",
        mainBkg: "#1e293b",
        nodeBorder: "#374151",
        clusterBkg: "#1e293b",
        titleColor: "#f1f5f9",
        edgeLabelBackground: "#1e293b",
        attributeBackgroundColorEven: "#1e293b",
        attributeBackgroundColorOdd: "#0f172a",
        fontSize: "15px",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      },
    });
    _mermaidReady = true;
  }
  return m;
}

function applyStyles(container: HTMLDivElement | null) {
  if (!container) return;
  const svg = container.querySelector("svg");
  if (!svg) return;
  const vb = svg.getAttribute("viewBox");
  if (!vb) {
    const w = parseFloat(svg.getAttribute("width") || "800");
    const h = parseFloat(svg.getAttribute("height") || "400");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
  }
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.style.cssText = "display:block;width:100%;height:auto;max-width:100%;";
}

const DiagramCard: React.FC<DiagramCardProps> = ({ type = "flowchart", title, mermaid: mermaidCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);
  const idRef       = useRef("mmd-" + (++_cnt));

  const [copied,      setCopied]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [isFullscreen,setIsFullscreen]= useState(false);
  const [svgHtml,     setSvgHtml]     = useState("");
  const [zoom,        setZoom]        = useState(1);

  const typeKey = (type || "flowchart").toLowerCase();
  const label   = TYPE_LABEL[typeKey] || "Diagram";
  const colors  = BADGE_COLORS[typeKey] || { bg: "#f9fafb", text: "#374151", border: "#e5e7eb" };

  // Decode \\n escape sequences that came through JSON transport
  const rawCode = (mermaidCode ?? "")
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g,   "\n")
    .trim();

  // Render SVG once
  useEffect(() => {
    if (!rawCode) return;
    let gone = false;
    getMermaid()
      .then((m) => m.render(idRef.current, rawCode))
      .then((result: any) => {
        if (gone) return;
        const svg = result?.svg ?? result;
        if (typeof svg === "string") setSvgHtml(svg);
      })
      .catch((e: any) => {
        if (!gone) setError(e?.message || "Render error");
      });
    return () => { gone = true; };
  }, [rawCode]);

  // Inject into card container
  useEffect(() => {
    if (svgHtml && containerRef.current) {
      containerRef.current.innerHTML = svgHtml;
      applyStyles(containerRef.current);
    }
  }, [svgHtml]);

  // Inject into modal container
  useEffect(() => {
    if (svgHtml && isFullscreen && modalRef.current) {
      modalRef.current.innerHTML = svgHtml;
      applyStyles(modalRef.current);
    }
  }, [svgHtml, isFullscreen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const S = {
    card: { width:"100%", maxWidth:720, borderRadius:16, border:"1px solid #e5e7eb", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden", margin:"8px 0" } as React.CSSProperties,
    hdr:  { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"linear-gradient(135deg,#f8fafc,#f1f5f9)", borderBottom:"1px solid #f0f0f0" } as React.CSSProperties,
    body: { padding:20, minHeight:220, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflowX:"auto" } as React.CSSProperties,
    btn:  { display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", color:"#6b7280" } as React.CSSProperties,
    ico:  { padding:6, borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center" } as React.CSSProperties,
  };

  const Badge = ({ small }: { small?: boolean }) => (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding: small ? "3px 10px" : "4px 12px", borderRadius:999, border:"1px solid "+colors.border, background:colors.bg, color:colors.text, fontSize: small ? 11 : 12, fontWeight:600 }}>
      {typeKey === "mindmap"      ? <Network size={12} /> :
       typeKey === "sequence"     ? <ArrowRightLeft size={12} /> :
       typeKey === "gantt"        ? <Calendar size={12} /> :
       typeKey === "pie"          ? <PieChart size={12} /> :
       typeKey === "er"           ? <Database size={12} /> :
       typeKey === "classdiagram" ? <Layers size={12} /> :
       typeKey === "statediagram" ? <Activity size={12} /> :
       typeKey === "timeline"     ? <Clock size={12} /> :
                                   <GitBranch size={12} />}
      {label}
    </span>
  );

  const Spinner = () => (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, color:"#9ca3af" }}>
      <div style={{ width:28, height:28, border:"3px solid #e5e7eb", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <span style={{ fontSize:13 }}>Rendering diagram…</span>
    </div>
  );

  const ErrorView = () => (
    <div style={{ width:"100%" }}>
      <div style={{ padding:"8px 12px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, marginBottom:12 }}>
        <span style={{ fontSize:12, color:"#dc2626", fontWeight:500 }}>⚠ Diagram syntax error — showing source</span>
      </div>
      <pre style={{ fontSize:12, color:"#374151", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:10, padding:16, overflow:"auto", fontFamily:"monospace", whiteSpace:"pre-wrap" }}>{rawCode}</pre>
    </div>
  );

  return (
    <>
      {/* ── CARD ─────────────────────────────────────────────────── */}
      <div style={{
        width: "100%", maxWidth: 760,
        borderRadius: 20,
        border: "1px solid #1f2937",
        background: "#0f172a",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        overflow: "hidden",
        margin: "10px 0",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px",
          background: "linear-gradient(135deg,#1e293b,#111827)",
          borderBottom: "1px solid #1f2937",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge small />
            {title && (
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button style={{ ...S.btn, color: copied ? "#34d399" : "#94a3b8", background: "#1e293b", borderColor: "#334155" }} onClick={handleCopy}>
              {copied ? <><Check size={12} style={{ color: "#34d399" }} />Copied!</> : <><Copy size={12} />Copy</>}
            </button>
            <button style={{ ...S.ico, background: "#1e293b", borderColor: "#334155", color: "#94a3b8" }} onClick={() => { setIsFullscreen(true); setZoom(1); }}>
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Diagram */}
        <div style={{ padding: "20px 16px", minHeight: 240, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", overflowX: "auto" }}>
          {error ? <ErrorView /> : !svgHtml ? <Spinner /> : <div ref={containerRef} style={{ width: "100%", overflowX: "auto" }} />}
        </div>

        {/* Footer */}
        {svgHtml && !error && (
          <div style={{ padding: "7px 18px", borderTop: "1px solid #1f2937", background: "#0f172a", fontSize: 11, color: "#475569", display: "flex", gap: 6 }}>
            <span>✦ Mermaid.js</span><span>·</span>
            <button onClick={() => { setIsFullscreen(true); setZoom(1); }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 11, padding: 0 }}>Expand ↗</button>
          </div>
        )}
      </div>

      {/* ── FULLSCREEN MODAL ──────────────────────────────────────────── */}
      {isFullscreen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsFullscreen(false); }}
          style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ width:"100%", maxWidth:1200, height:"92vh", background:"#0f172a", border:"1px solid #1e293b", borderRadius:20, boxShadow:"0 30px 80px rgba(0,0,0,0.6)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* Modal Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", background:"linear-gradient(135deg,#1e293b,#111827)", borderBottom:"1px solid #1f2937", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <Badge />
                {title && <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#e2e8f0" }}>{title}</h3>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button style={{ ...S.ico, background:"#1e293b", borderColor:"#334155", color:"#94a3b8" }} onClick={() => setZoom((z) => Math.max(0.3, parseFloat((z - 0.15).toFixed(2))))}><ZoomOut size={15} /></button>
                <span style={{ fontSize:12, color:"#94a3b8", fontWeight:500, minWidth:40, textAlign:"center" }}>{Math.round(zoom * 100)}%</span>
                <button style={{ ...S.ico, background:"#1e293b", borderColor:"#334155", color:"#94a3b8" }} onClick={() => setZoom((z) => Math.min(3, parseFloat((z + 0.15).toFixed(2))))}><ZoomIn size={15} /></button>
                <button style={{ ...S.ico, background:"#1e293b", borderColor:"#334155", color:"#94a3b8" }} onClick={() => setZoom(1)}><RotateCcw size={13} /></button>
                <div style={{ width:1, height:20, background:"#334155", margin:"0 4px" }} />
                <button style={{ ...S.btn, color: copied ? "#34d399" : "#94a3b8", background:"#1e293b", borderColor:"#334155" }} onClick={handleCopy}>
                  {copied ? <><Check size={12} style={{ color:"#34d399" }} />Copied!</> : <><Copy size={12} />Copy Code</>}
                </button>
                <button style={{ padding:7, borderRadius:10, border:"none", background:"#1e293b", cursor:"pointer", display:"flex", alignItems:"center", color:"#94a3b8" }} onClick={() => setIsFullscreen(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div style={{ flex:1, overflow:"auto", padding:32, background:"#0f172a", display:"flex", alignItems:"flex-start", justifyContent:"center" }}>
              {error ? (
                <pre style={{ fontSize:13, color:"#e2e8f0", background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:24, overflow:"auto", fontFamily:"monospace", whiteSpace:"pre-wrap", width:"100%" }}>{rawCode}</pre>
              ) : (
                <div style={{ transform:"scale("+zoom+")", transformOrigin:"top center", transition:"transform 0.2s ease", width:"100%" }}>
                  <div ref={modalRef} style={{ width:"100%", background:"#111827", borderRadius:12, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.4)" }} />
                </div>
              )}
            </div>
          </div>
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      )}
    </>
  );
};

export default DiagramCard;