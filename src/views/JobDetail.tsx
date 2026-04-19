"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from '@/lib/axios';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Trophy,
  Globe,
  Clock,
  CheckCircle2,
  Bookmark,
  Zap,
  ChevronRight,
  Menu,
  User
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const JobDetail = () => {
  const { toggleSidebar } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useRouter();
  const isMobile = useIsMobile();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/jobs/${id}`);
      setJob(response.data.job);
      setError(null);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to synchronize job coordinates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJobDetail();
  }, [id]);

  const handleApply = async () => {
    if (!job?.link) return;
    setApplying(true);
    try {
      await axiosInstance.post(`/jobs/${id}/apply`);
    } catch (err) {
      console.error('Error tracking application:', err);
    } finally {
      setApplying(false);
      window.open(job.link, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center max-w-sm shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <button onClick={() => navigate.push('/jobs')} className="mt-6 text-primary font-medium flex items-center gap-2 mx-auto">
            <ArrowLeft size={16} /> Back to missions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F8F9FA] relative overflow-hidden">
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
            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">Mission Briefing</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-0 pt-0 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-10 animate-in fade-in duration-700">
          <button
            onClick={() => navigate.back()}
            className="flex items-center gap-2 text-[#444746] hover:text-primary transition-colors text-[15px] font-medium group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Discovery
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-full border border-gray-200 hover:bg-white hover:border-primary/30 transition-all">
              <Bookmark size={20} className="text-gray-400" />
            </button>
            <button className="p-2.5 rounded-full border border-gray-200 hover:bg-white hover:border-primary/30 transition-all">
              <ExternalLink size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* Job Header */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                <div className="w-20 h-20 rounded-[28px] bg-gray-50 border border-gray-100 flex items-center justify-center text-primary shrink-0 shadow-sm text-3xl font-bold">
                  {job.company?.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-primary font-semibold text-[15px] mb-2">{job.company}</p>
                  <h1 className="text-3xl md:text-5xl font-medium text-[#202124] tracking-tight leading-tight mb-6">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[13px] text-[#444746] font-medium">
                      <MapPin size={14} className="text-gray-400" /> {job.location || "Remote"}
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[13px] text-[#444746] font-medium">
                      <Clock size={14} className="text-gray-400" /> {job.employmentType || "Full-time"}
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-[#202124] text-white rounded-full text-[13px] font-medium">
                      <DollarSign size={14} className="text-primary" /> {job.jobSalary || "$140k - $180k"}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApply}
                disabled={applying || !job.link}
                className="w-full py-4 bg-primary text-white font-semibold text-[16px] rounded-[20px] transition-all hover:bg-blue-600 active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-12"
              >
                {applying ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                Launch Application
              </button>

              <div className="space-y-12">
                <section>
                  <h3 className="text-[17px] font-semibold text-[#202124] mb-6">Mission Summary</h3>
                  <div className="text-[#444746] leading-relaxed text-[16px] opacity-90 prose whitespace-pre-wrap">
                    {job.description}
                  </div>
                </section>

                {job.requirements && (
                  <section>
                    <h3 className="text-[17px] font-semibold text-[#202124] mb-6">Credential Matrix</h3>
                    <div className="text-[#444746] leading-relaxed text-[15px] p-8 bg-gray-50 rounded-[24px] border border-gray-100 whitespace-pre-wrap">
                      {job.requirements}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-[15px] font-semibold text-[#202124] mb-6">Strategic Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: "Synchronized", value: formatDate(job.postedDate) },
                  { label: "Cycle End", value: job.deadline ? formatDate(job.deadline) : "Continuous" },
                  { label: "Tier Required", value: job.experience || "L4 Designer" },
                  { label: "Deployment", value: job.employmentType || "Remote" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-[13px] text-[#444746] opacity-60 uppercase tracking-tight">{item.label}</span>
                    <span className="text-[14px] font-medium text-[#202124]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/5">
                    <Trophy size={20} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[11px] uppercase">Neural Match</span>
                </div>
                <h3 className="text-4xl font-semibold text-[#202124] mb-1">94%</h3>
                <p className="text-[#444746] text-[13px] font-medium opacity-80 mb-6">Compatibility Index with your Skill Profile</p>

                <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-primary/5 text-emerald-600 text-[12px] font-semibold">
                  <CheckCircle2 size={16} />
                  Verified by CareerAI Core
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full translate-x-10 -translate-y-10" />
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary">
                  <Building2 size={18} />
                </div>
                <h3 className="text-[15px] font-semibold text-[#202124]">{job.company}</h3>
              </div>
              <p className="text-[#444746] text-[14px] leading-relaxed mb-8 opacity-70 italic">
                "{job.companyDescription || 'Transforming industries through intelligent innovation and customer-centric design.'}"
              </p>
              {job.companyWebsite && (
                <a href={job.companyWebsite} target="_blank" className="flex items-center justify-between w-full p-4 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-colors group">
                  <span className="text-[13px] font-medium">Company Profile</span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
