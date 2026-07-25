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
      theme: "neutral",
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
        nodeSpacing: 40,
        rankSpacing: 45,
      },
      themeVariables: {
        darkMode: false,
        background: "#ffffff",
        primaryColor: "#eff6ff",
        primaryTextColor: "#1e293b",
        primaryBorderColor: "#3b82f6",
        lineColor: "#64748b",
        secondaryColor: "#f0fdf4",
        tertiaryColor: "#faf5ff",
        mainBkg: "#ffffff",
        nodeBorder: "#93c5fd",
        clusterBkg: "#f8fafc",
        titleColor: "#0f172a",
        edgeLabelBackground: "#ffffff",
        fontSize: "14px",
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

  const Badge = ({ small }: { small?: boolean }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: small ? "3px 10px" : "4px 12px",
        borderRadius: 999,
        border: "1px solid " + colors.border,
        background: colors.bg,
        color: colors.text,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
      }}
    >
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
    <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
      <span className="text-xs font-medium">Rendering diagram…</span>
    </div>
  );

  const ErrorView = () => (
    <div className="w-full p-2">
      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl mb-3">
        <span className="text-xs text-red-600 font-semibold">⚠ Diagram syntax error — showing source</span>
      </div>
      <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto font-mono whitespace-pre-wrap">{rawCode}</pre>
    </div>
  );

  return (
    <>
      {/* ── CARD ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl my-3 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-50/90 border-b border-slate-100 backdrop-blur-md select-none">
          <div className="flex items-center gap-2 min-w-0">
            <Badge small />
            {title && (
              <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate max-w-[180px] sm:max-w-[280px]">
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={() => { setIsFullscreen(true); setZoom(1); }}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-2xs"
              title="Expand Fullscreen"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* Diagram Body Container */}
        <div className="p-3 sm:p-5 min-h-[160px] max-h-[360px] sm:max-h-[460px] bg-white flex items-center justify-center overflow-auto scrollbar-thin">
          {error ? <ErrorView /> : !svgHtml ? <Spinner /> : <div ref={containerRef} className="w-full overflow-x-auto flex justify-center" />}
        </div>

        {/* Footer */}
        {svgHtml && !error && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 font-medium flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span>Interactive Diagram</span>
            </div>
            <button
              onClick={() => { setIsFullscreen(true); setZoom(1); }}
              className="hover:text-primary transition-colors font-semibold flex items-center gap-1"
            >
              <span>Expand view</span>
              <span>↗</span>
            </button>
          </div>
        )}
      </div>

      {/* ── FULLSCREEN MODAL ──────────────────────────────────────────── */}
      {isFullscreen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsFullscreen(false); }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-5xl h-[88vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-100 shrink-0 select-none">
              <div className="flex items-center gap-3 min-w-0">
                <Badge />
                {title && <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">{title}</h3>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.3, parseFloat((z - 0.15).toFixed(2))))}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-xs font-bold text-slate-600 min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(3, parseFloat((z + 0.15).toFixed(2))))}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    title="Reset Zoom"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-2xs flex items-center gap-1"
                >
                  {copied ? <><Check size={12} className="text-emerald-500" /><span className="text-emerald-600">Copied</span></> : <><Copy size={12} /><span>Copy</span></>}
                </button>

                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50/50 flex items-center justify-center">
              {error ? (
                <ErrorView />
              ) : (
                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }} className="w-full">
                  <div ref={modalRef} className="w-full bg-white rounded-2xl p-6 border border-slate-150 shadow-sm flex justify-center" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiagramCard;