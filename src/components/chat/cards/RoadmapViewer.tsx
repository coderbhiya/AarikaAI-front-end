"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileText, Image as ImageIcon } from "lucide-react";

interface RoadmapViewerProps {
  chart: string;
  title?: string;
}

export default function RoadmapViewer({ chart, title = "Career Roadmap" }: RoadmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Inter, sans-serif",
    });
  }, []);

  useEffect(() => {
    if (isClient && chart && containerRef.current) {
      const renderChart = async () => {
        try {
          // Add a unique ID to prevent conflicts in case of multiple charts
          const id = `mermaid-chart-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvgContent(svg);
        } catch (error) {
          console.error("Error rendering mermaid chart:", error);
          setSvgContent(`<div class="text-red-500 text-sm font-medium">Failed to render roadmap diagram. The AI generated invalid Mermaid syntax.</div>`);
        }
      };
      renderChart();
    }
  }, [chart, isClient]);

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2, 
        backgroundColor: "#ffffff",
        useCORS: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-3 my-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-full">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-[14px] font-bold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={downloadSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Download as SVG Vector"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SVG</span>
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-[#0f0f0f] rounded-lg hover:bg-black transition-colors shadow-sm"
            title="Download as PDF Document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="overflow-x-auto p-4 flex justify-center bg-white min-h-[150px]"
        dangerouslySetInnerHTML={{ __html: svgContent || '<div class="w-full animate-pulse flex space-x-4"><div class="flex-1 space-y-6 py-1"><div class="h-2 bg-slate-100 rounded"></div><div class="space-y-3"><div class="grid grid-cols-3 gap-4"><div class="h-2 bg-slate-100 rounded col-span-2"></div><div class="h-2 bg-slate-100 rounded col-span-1"></div></div><div class="h-2 bg-slate-100 rounded"></div></div></div></div>' }}
      />
    </div>
  );
}
