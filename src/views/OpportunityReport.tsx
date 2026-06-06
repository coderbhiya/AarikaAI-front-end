"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, CheckCircle2, XCircle, TrendingUp, Briefcase, Zap, ShieldAlert, Award, BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OpportunityReport({ jobId }: { jobId: string }) {
  const navigate = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/jobs/${jobId}/opportunity-analysis`);
        setReport(response.data.report);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load opportunity report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full w-full bg-[#f3f2ef]">
        <Loader2 size={40} className="text-primary animate-spin" />
        <p className="mt-4 font-bold text-gray-600">Analyzing Career Opportunity...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f3f2ef]">
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={() => navigate.back()} className="mt-4 text-primary underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f3f2ef] overflow-y-auto">
      <header className="sticky top-0 z-50 flex items-center px-4 md:px-8 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button onClick={() => navigate.back()} className="p-2 mr-4 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-[#202124]">Opportunity Intelligence Report</h1>
      </header>

      <div className="max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Top Overview */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Move Type</p>
             <h2 className="text-2xl font-bold text-primary">{report.moveType}</h2>
             <p className="text-sm text-gray-500 font-medium mt-2 max-w-lg">{report.careerImpact}</p>
          </div>
          <div className="shrink-0 flex flex-col items-center justify-center w-32 h-32 rounded-full border-8 border-emerald-100 bg-emerald-50">
             <span className="text-3xl font-black text-emerald-600">{report.opportunityScore}%</span>
             <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">AI Match</span>
          </div>
        </section>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                 <Briefcase size={20} />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">Interview Probability</p>
                 <p className="text-lg font-bold text-[#202124]">{report.interviewProbability}</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                 <Zap size={20} />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">Offer Probability</p>
                 <p className="text-lg font-bold text-[#202124]">{report.offerProbability}</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                 <TrendingUp size={20} />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">Salary Growth</p>
                 <p className="text-lg font-bold text-[#202124]">{report.salaryImprovement}</p>
              </div>
           </div>
        </div>

        {/* Gap Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Strengths */}
           <section className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
             <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2 mb-4">
                <CheckCircle2 size={20} /> Why You Match
             </h3>
             <ul className="space-y-2 mb-4">
               {report.reasoning?.[0] && <li className="text-sm font-medium text-gray-600">{report.reasoning[0]}</li>}
             </ul>
             <div className="flex flex-wrap gap-2 mt-4">
                {report.strengths?.map((s: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">{s}</span>
                ))}
             </div>
           </section>

           {/* Weaknesses */}
           <section className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
             <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4">
                <XCircle size={20} /> Gap Analysis
             </h3>
             <ul className="space-y-2 mb-4">
               {report.reasoning?.[1] && <li className="text-sm font-medium text-gray-600">{report.reasoning[1]}</li>}
             </ul>
             <div className="flex flex-wrap gap-2 mt-4">
                {report.missingSkills?.map((s: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-red-50 text-red-600 rounded text-xs font-bold">{s}</span>
                ))}
             </div>
           </section>
        </div>

        {/* Recommendations Action Plan */}
        <section className="bg-[#202124] text-white p-6 md:p-8 rounded-2xl shadow-md">
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
             <ShieldAlert size={24} className="text-primary" /> AI Recommendations
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen size={16}/> Top Courses to Take</h4>
                <ul className="space-y-2">
                  {report.recommendations?.topCourses?.map((course: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 font-medium list-disc ml-4">{course}</li>
                  ))}
                </ul>
             </div>
             <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase size={16}/> Suggested Projects</h4>
                <ul className="space-y-2">
                  {report.recommendations?.topProjects?.map((project: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 font-medium list-disc ml-4">{project}</li>
                  ))}
                </ul>
             </div>
           </div>
           
           <div className="mt-8 border-t border-gray-700 pt-6 flex justify-between items-center">
             <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-2"><Award size={16}/> Missing Skills</h4>
                <p className="text-sm text-gray-300">{report.recommendations?.topMissingSkills?.join(", ")}</p>
             </div>
             <button className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-blue-600 shadow-lg shadow-primary/20 transition-all">
               Create Mission
             </button>
           </div>
        </section>

      </div>
    </div>
  );
}
