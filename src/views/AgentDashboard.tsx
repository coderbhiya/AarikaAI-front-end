"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAgentConfig,
  updateAgentConfig,
  getJobMatches,
  tailorResumeForJob,
  triggerAutoApply,
  getApplicationsLog,
  syncJobsAggregator,
  AgentConfig,
  JobMatch,
  AutoApplyLog,
} from "@/services/agentApi";
import {
  Bot,
  Sparkles,
  Play,
  RefreshCw,
  CheckCircle2,
  Sliders,
  FileText,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  UserCheck,
  Menu,
} from "lucide-react";

export default function AgentDashboard() {
  const { toggleSidebar } = useAuth();
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [logs, setLogs] = useState<AutoApplyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"matches" | "history" | "settings">("matches");

  // Tailored Resume Preview Modal State
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);
  const [tailoredPreview, setTailoredPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfgRes, matchRes, logRes] = await Promise.all([
        getAgentConfig().catch(() => null),
        getJobMatches().catch(() => ({ matches: [] })),
        getApplicationsLog().catch(() => ({ logs: [] })),
      ]);

      if (cfgRes?.config) setConfig(cfgRes.config);
      if (matchRes?.matches) setMatches(matchRes.matches);
      if (logRes?.logs) setLogs(logRes.logs);
    } catch (err) {
      console.error("Failed to load agent data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoApply = async () => {
    if (!config) return;
    const newStatus = !config.isAutoApplyEnabled;
    setConfig({ ...config, isAutoApplyEnabled: newStatus });
    try {
      await updateAgentConfig({ isAutoApplyEnabled: newStatus });
    } catch (err) {
      console.error("Failed to update auto apply setting", err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      const res = await updateAgentConfig(config);
      if (res.config) setConfig(res.config);
      alert("Agent preferences saved successfully!");
    } catch (err) {
      alert("Failed to save agent settings");
    }
  };

  const handleTriggerRun = async () => {
    setTriggering(true);
    try {
      const res = await triggerAutoApply();
      alert(`Auto-Apply Agent Run Completed! Applied to ${res.appliedCount || 0} matching jobs.`);
      loadData();
    } catch (err) {
      alert("Error triggering auto-apply agent run.");
    } finally {
      setTriggering(false);
    }
  };

  const handleSyncJobs = async () => {
    setSyncing(true);
    try {
      await syncJobsAggregator();
      alert("Fresh active jobs sync started in background! Matches will update shortly.");
      setTimeout(() => loadData(), 1500);
    } catch (err) {
      alert("Failed to sync jobs.");
    } finally {
      setSyncing(false);
    }
  };

  const handlePreviewTailoredResume = async (job: JobMatch) => {
    setSelectedMatch(job);
    setPreviewLoading(true);
    setTailoredPreview(null);
    try {
      const res = await tailorResumeForJob(job.id);
      setTailoredPreview(res.data);
    } catch (err) {
      alert("Failed to generate tailored resume preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F8FAFC] relative overflow-y-auto">
      {/* Top Navigation Bar with Sidebar Toggle */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-gray-200 w-full shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-gray-900 text-sm md:text-base">Auto-Apply Career AI Agent</h2>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 w-full">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E1B4B] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-400 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" /> Autonomous Career AI Agent
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Auto-Apply & ATS Resume Tailoring Agent
              </h1>
              <p className="text-gray-300 text-sm max-w-2xl">
                Automatically matches your profile with active, non-expired jobs, custom-tailors your resume bullet points for high ATS scores, and auto-submits applications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncJobs}
                disabled={syncing}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition flex items-center gap-2 border border-white/10 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing Jobs..." : "Sync Fresh Jobs"}
              </button>

              <button
                onClick={handleTriggerRun}
                disabled={triggering || !config?.isAutoApplyEnabled}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50"
              >
                <Play className={`w-4 h-4 fill-white ${triggering ? "animate-bounce" : ""}`} />
                {triggering ? "Running Agent..." : "Run Auto-Apply Now"}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Agent Status</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAutoApply}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config?.isAutoApplyEnabled ? "bg-emerald-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config?.isAutoApplyEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-semibold text-white">
                  {config?.isAutoApplyEnabled ? "Active (Auto)" : "Paused"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Min Match Score</span>
              <p className="text-lg font-bold text-white">{config?.minMatchPercentage || 70}% ATS Match</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Daily Limit</span>
              <p className="text-lg font-bold text-white">{config?.maxApplicationsPerDay || 10} Apps / day</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Total Applied</span>
              <p className="text-lg font-bold text-emerald-400">{logs.length} Submissions</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 gap-8">
          <button
            onClick={() => setActiveTab("matches")}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "matches"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Active Matches ({matches.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" /> Tailored Resumes & History ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sliders className="w-4 h-4" /> Agent Preferences & Rules
          </button>
        </div>

        {/* Tab 1: Matched Jobs */}
        {activeTab === "matches" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Evaluating active non-expired job matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-800 font-semibold">No Active Job Matches Found</h3>
                <p className="text-gray-500 text-sm mt-1">Click "Sync Fresh Jobs" to pull latest active postings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-1">
                            {job.matchScore}% ATS Fit
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 leading-snug">{job.title}</h3>
                          <p className="text-sm font-medium text-gray-600">{job.company} • {job.location || "Remote"}</p>
                        </div>
                        {job.hasApplied ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-xs line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handlePreviewTailoredResume(job)}
                        className="px-3.5 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Preview ATS Resume
                      </button>

                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
                        >
                          Job Link <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Tailored Resumes & History */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Auto-Apply Log & Tailored ATS Packages</h2>
              <span className="text-xs text-gray-500 font-medium">Updated real-time</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No automated applications recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-gray-50/50 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-base">{log.jobTitle}</h3>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                            {log.matchScore}% ATS Score
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{log.companyName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {log.appliedAt ? new Date(log.appliedAt).toLocaleDateString() : "Just now"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {log.status}
                        </span>
                      </div>
                    </div>

                    {log.TailoredResume?.tailoredSummary && (
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs space-y-1">
                        <span className="font-bold text-gray-700">Tailored Resume Bio Highlight:</span>
                        <p className="text-gray-600 italic">"{log.TailoredResume.tailoredSummary}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === "settings" && config && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
              Agent Auto-Apply Rules & Preference Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">Minimum ATS Match Percentage (%)</label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={config.minMatchPercentage}
                  onChange={(e) => setConfig({ ...config, minMatchPercentage: parseInt(e.target.value) || 70 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <p className="text-xs text-gray-500">Agent will only apply to jobs matching at least this score.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">Max Applications Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.maxApplicationsPerDay}
                  onChange={(e) => setConfig({ ...config, maxApplicationsPerDay: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <p className="text-xs text-gray-500">Daily limit to maintain high quality auto-submissions.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition shadow-md"
              >
                Save Agent Settings
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tailored Resume Preview Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Tailored ATS Resume Preview</h3>
                <p className="text-xs text-gray-500">For {selectedMatch.title} at {selectedMatch.company}</p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {previewLoading ? (
              <div className="text-center py-12">
                <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Generating ATS Tailored Resume for target job...</p>
              </div>
            ) : tailoredPreview ? (
              <div className="space-y-4 text-sm">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-800 text-xs">Tailored Headline:</span>
                  <p className="font-bold text-gray-900 text-base">{tailoredPreview.tailoredHeadline}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-gray-800 text-xs">Tailored Bio / Executive Summary:</span>
                  <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 text-xs leading-relaxed">
                    {tailoredPreview.tailoredSummary}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-gray-800 text-xs">Prioritized ATS Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoredPreview.tailoredSkills?.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary font-semibold text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">Unable to load preview.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
