import React, { useState, useEffect } from "react";
import { 
  FileText, Award, Clock, CheckCircle2, AlertCircle, ChevronRight, 
  Sparkles, TrendingUp, BookOpen, ExternalLink, RefreshCw, BarChart2, ShieldCheck, Download
} from "lucide-react";
import axiosInstance from "@/lib/axios";

export interface TestReportItem {
  id: string;
  testName: string;
  companyName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  readinessIndex: number;
  passed: boolean;
  timeSpentSeconds: number;
  sectionBreakdown: any;
  remediationRoadmap: string[];
  status: string;
  createdAt: string;
}

const downloadPDFReport = (report: TestReportItem) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${report.testName} - Official AI Diagnostic Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 900; color: #2563eb; letter-spacing: -1px; }
          .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; border-radius: 20px; margin-top: 8px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; }
          .card-title { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }
          .card-val { font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px; }
          .section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 12px; border-left: 4px solid #2563eb; padding-left: 10px; }
          .roadmap { background: #0f172a; color: #fff; padding: 20px; border-radius: 16px; margin-bottom: 30px; }
          .roadmap li { margin-bottom: 8px; font-size: 13px; color: #cbd5e1; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">AarikaAI Diagnostic Assessment Certificate</div>
          <div class="badge">${report.companyName || "Standard Assessment"}</div>
          <h1 style="margin: 10px 0 5px 0; font-size: 24px;">${report.testName}</h1>
          <p style="margin: 0; color: #64748b; font-size: 13px;">Date: ${new Date(report.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Score Obtained</div>
            <div class="card-val" style="color: #059669;">${report.score || 0} / ${report.totalMarks || 20}</div>
          </div>
          <div class="card">
            <div class="card-title">Percentage</div>
            <div class="card-val">${report.percentage || 0}%</div>
          </div>
          <div class="card">
            <div class="card-title">Readiness Index</div>
            <div class="card-val" style="color: #2563eb;">${report.readinessIndex || 75}%</div>
          </div>
          <div class="card">
            <div class="card-title">Pass Status</div>
            <div class="card-val">${report.passed ? "PASSED" : "NEEDS PRACTICE"}</div>
          </div>
        </div>

        <div class="section-title">AI Skill Gap & Weakness Analysis</div>
        <div class="roadmap">
          <h3 style="margin-top:0; font-size:14px; color:#60a5fa;">Targeted Remediation Roadmap (Synced with AarikaAI MemoryOS):</h3>
          <ul>
            ${(report.remediationRoadmap || ["Review incorrect answer explanations"]).map((item: string) => `<li>• ${item}</li>`).join("")}
          </ul>
        </div>

        <div class="footer">
          Generated automatically by AarikaAI Intelligence Platform • MemoryOS Active
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

const AssessmentReportsTab: React.FC = () => {
  const [reports, setReports] = useState<TestReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TestReportItem | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/company-assessment/my-reports");
      if (res.data && res.data.success) {
        setReports(res.data.data || []);
      }
    } catch (err) {
      console.warn("[AssessmentReportsTab] Failed to fetch test reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalTests = reports.length;
  const avgScore = totalTests > 0 
    ? Math.round(reports.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalTests)
    : 0;
  const passedCount = reports.filter(r => r.passed).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tests */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Reports</p>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">{totalTests} Tests</h3>
            <p className="text-[11px] text-gray-400 font-medium">Evaluated Assessment Records</p>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Score</p>
            <h3 className="text-2xl font-black text-emerald-600 leading-tight">{avgScore}%</h3>
            <p className="text-[11px] text-emerald-600/80 font-semibold">{passedCount} Passed Assessments</p>
          </div>
        </div>

        {/* AI Readiness Index */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 text-blue-400 flex items-center justify-center font-bold border border-white/10">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">Readiness Telemetry</p>
            <h3 className="text-2xl font-black text-white leading-tight">Active Sync</h3>
            <p className="text-[11px] text-gray-300 font-medium">Indexed for AarikaAI Coaching</p>
          </div>
        </div>
      </div>

      {/* Main Reports Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Diagnostic Assessment Reports</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chronological record of company mock tests & subject assessments</p>
          </div>
          <button 
            onClick={fetchReports}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Refresh Reports"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <RefreshCw size={24} className="animate-spin text-blue-600" />
            <p className="text-xs font-medium">Loading saved test reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto border border-gray-100">
              <FileText size={28} className="text-gray-300" />
            </div>
            <h4 className="text-sm font-bold text-gray-700">No Assessment Reports Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Start a practice test (e.g. Google SDE OA, TCS NQT, or Chemistry Mock Test) in the AI Chat area to generate diagnostic reports here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const formattedDate = report.createdAt 
                ? new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : "Recent";

              return (
                <div 
                  key={report.id}
                  className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      report.passed 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {report.percentage}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-extrabold text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                          {report.testName}
                        </h4>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 uppercase">
                          {report.companyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {Math.round((report.timeSpentSeconds || 0) / 60)} mins
                        </span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className={report.passed ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                          {report.passed ? "PASSED" : "NEEDS PRACTICE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => downloadPDFReport(report)}
                      className="px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-blue-200"
                      title="Download PDF Diagnostic Report"
                    >
                      <Download size={14} />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-5 py-2.5 bg-white border border-gray-200 text-gray-800 font-bold text-xs rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm flex items-center gap-2"
                    >
                      <span>View Report</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL DIAGNOSTIC REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white border border-gray-100/80 rounded-3xl shadow-2xl max-w-3xl w-full text-left overflow-hidden relative p-6 md:p-8 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 shrink-0">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">
                  Official AI Diagnostic Report
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">{selectedReport.testName}</h2>
                <p className="text-xs text-gray-500 font-semibold">{selectedReport.companyName} Assessment • Saved in Profile</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Report Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* Score & Gauge Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-left">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Score Obtained</span>
                  <p className="text-2xl font-black text-emerald-950 mt-1">{selectedReport.score} / {selectedReport.totalMarks || 20}</p>
                  <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{selectedReport.percentage}% Total</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-left">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Readiness Index</span>
                  <p className="text-2xl font-black text-blue-950 mt-1">{selectedReport.readinessIndex}%</p>
                  <p className="text-[10px] font-bold text-blue-600 mt-0.5">Benchmarked</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 text-left">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">Time Spent</span>
                  <p className="text-2xl font-black text-purple-950 mt-1">{Math.round((selectedReport.timeSpentSeconds || 0) / 60)}m</p>
                  <p className="text-[10px] font-bold text-purple-600 mt-0.5">Pacing Tracked</p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-left">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Status</span>
                  <p className="text-2xl font-black text-indigo-950 mt-1">{selectedReport.passed ? "PASS" : "REVISE"}</p>
                  <p className="text-[10px] font-bold text-indigo-600 mt-0.5">Validated</p>
                </div>
              </div>

              {/* AI Remediation Roadmap */}
              {selectedReport.remediationRoadmap && selectedReport.remediationRoadmap.length > 0 && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                    <h4 className="font-bold text-sm text-white">AI Weakness Detection & Remediation Roadmap</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {selectedReport.remediationRoadmap.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section / Answers Summary */}
              {selectedReport.sectionBreakdown && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <BarChart2 size={16} className="text-blue-600" />
                    Performance & Section Metrics
                  </h4>
                  <div className="text-xs text-gray-700 font-mono bg-white p-3 rounded-xl border border-gray-200 overflow-x-auto">
                    <pre className="whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(selectedReport.sectionBreakdown, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 shrink-0 flex items-center justify-between">
              <button
                onClick={() => downloadPDFReport(selectedReport)}
                className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all border border-blue-200 flex items-center gap-2"
              >
                <Download size={15} />
                <span>Download PDF Report</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all shadow-sm"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentReportsTab;
