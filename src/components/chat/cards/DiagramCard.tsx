"use client";

import React, { useEffect, useRef, useState } from "react";
import { Copy, Check, Maximize2, X, Download, ZoomIn, ZoomOut, RotateCcw, Sparkles } from "lucide-react";

interface DiagramCardProps {
  type?: string;
  title?: string;
  mermaid: string;
}

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
        nodeSpacing: 30,
        rankSpacing: 35,
        padding: 12,
      },
      themeVariables: {
        darkMode: false,
        background: "#ffffff",
        primaryColor: "#f8fafc",
        primaryTextColor: "#0f172a",
        primaryBorderColor: "#cbd5e1",
        lineColor: "#64748b",
        secondaryColor: "#f1f5f9",
        tertiaryColor: "#faf5ff",
        mainBkg: "#ffffff",
        nodeBorder: "#cbd5e1",
        clusterBkg: "#f8fafc",
        titleColor: "#0f172a",
        edgeLabelBackground: "#ffffff",
        fontSize: "13px",
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
  let viewBoxWidth = 600;
  if (vb) {
    const parts = vb.split(/\s+/);
    if (parts.length === 4) {
      viewBoxWidth = parseFloat(parts[2]);
    }
  } else {
    const w = parseFloat(svg.getAttribute("width") || "600");
    const h = parseFloat(svg.getAttribute("height") || "350");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    viewBoxWidth = w;
  }
  
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  
  // Natural scaling: Don't blow up small diagrams to giant sizes!
  const targetMaxWidth = Math.min(Math.max(viewBoxWidth + 40, 320), 620);
  svg.style.cssText = `display: block; width: 100%; max-width: ${targetMaxWidth}px; height: auto; margin: 0 auto; transition: all 0.2s ease;`;
}

const DiagramCard: React.FC<DiagramCardProps> = ({ type = "flowchart", title, mermaid: mermaidCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const idRef = useRef("mmd-" + (++_cnt));

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [svgHtml, setSvgHtml] = useState("");
  const [zoom, setZoom] = useState(1);

  const rawCode = (mermaidCode ?? "")
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();

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

  useEffect(() => {
    if (svgHtml && containerRef.current) {
      containerRef.current.innerHTML = svgHtml;
      applyStyles(containerRef.current);
    }
  }, [svgHtml]);

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

  const handleDownloadSVG = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "diagram").replace(/\s+/g, "_").toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* ── CLAUDE-STYLE CENTERED EMBEDDED DIAGRAM ────────────────────── */}
      <div className="w-full my-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-slate-50/60 hover:bg-slate-50/90 border border-slate-200/60 rounded-2xl p-4 transition-all duration-200 group relative">
          
          {/* Top Bar with Minimal Floating Action Controls */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100/80">
                <Sparkles size={13} />
              </span>
              <span className="text-xs font-semibold text-slate-700 tracking-tight">
                {title || "Visual Diagram"}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-all flex items-center gap-1 border border-transparent hover:border-slate-200"
                title="Copy Mermaid Code"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSVG}
                className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
                title="Download SVG"
              >
                <Download size={13} />
              </button>

              <button
                onClick={() => { setIsFullscreen(true); setZoom(1); }}
                className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
                title="Expand Fullscreen"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>

          {/* Centered Clean SVG Body */}
          <div className="w-full flex justify-center items-center py-2 px-1 overflow-x-auto min-h-[120px] max-h-[360px] scrollbar-thin">
            {error ? (
              <div className="text-xs text-red-500 p-2 font-medium">Failed to render diagram syntax</div>
            ) : !svgHtml ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-4 font-medium animate-pulse">
                <span>Generating diagram...</span>
              </div>
            ) : (
              <div ref={containerRef} className="w-full flex justify-center items-center" />
            )}
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN MODAL ──────────────────────────────────────────── */}
      {isFullscreen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsFullscreen(false); }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-5xl h-[88vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-100 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">{title || "Visual Diagram"}</h3>
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
                  onClick={handleDownloadSVG}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download SVG</span>
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
            <div className="flex-1 overflow-auto p-6 bg-slate-50/40 flex items-center justify-center">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }} className="w-full flex justify-center">
                <div ref={modalRef} className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex justify-center" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiagramCard;