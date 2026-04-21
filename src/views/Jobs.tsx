"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { 
  ArrowLeft, Search, MapPin, Briefcase, X, ChevronRight, 
  Filter, Menu, User, Bookmark, ExternalLink, Building2, 
  DollarSign, Loader2, Trophy, Globe, Clock, CheckCircle2, Zap 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const Jobs = () => {
  const { toggleSidebar } = useAuth();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection State
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    employmentType: "",
  });
  const [availableFilters, setAvailableFilters] = useState({
    locations: [],
    employmentTypes: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15, // Slightly more for the scrollable list
    total: 0,
    totalPages: 0,
  });

  const fetchJobs = async (initial = false) => {
    try {
      setLoading(true);
      const { search, location, employmentType } = filters;
      const { page, limit } = pagination;

      const response = await axiosInstance.get("/jobs", {
        params: {
          page,
          limit,
          search,
          location,
          employmentType,
        },
      });

      const fetchedJobs = response.data.jobs;
      setJobs(fetchedJobs);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      });

      if (response.data.filters) {
        setAvailableFilters({
          locations: response.data.filters.locations || [],
          employmentTypes: response.data.filters.employmentTypes || [],
        });
      }

      // Default selection: first job if on desktop and nothing selected
      if (!isMobile && fetchedJobs.length > 0 && initial) {
        fetchJobDetail(fetchedJobs[0].id);
      } else if (!isMobile && fetchedJobs.length > 0 && !selectedJob) {
        fetchJobDetail(fetchedJobs[0].id);
      }

      setError(null);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load jobs. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetail = async (id: string) => {
    if (!id) return;
    try {
      setIsDetailLoading(true);
      const response = await axiosInstance.get(`/jobs/${id}`);
      setSelectedJob(response.data.job);
    } catch (err) {
      console.error('Error fetching job details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(true);
  }, []);

  useEffect(() => {
    if (pagination.page !== 1) fetchJobs();
  }, [pagination.page]);

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = (e: any) => {
    if (e) e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchJobs();
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      location: "",
      employmentType: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchJobs();
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleJobClick = (job: any) => {
    if (isMobile) {
      navigate.push(`/job/detail/?id=${job.id}`);
    } else {
      fetchJobDetail(job.id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f3f2ef] relative overflow-hidden">
      {/* Search Header (LinkedIn Style) */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-2 md:py-3 bg-white border-b border-gray-200 w-full shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-2 bg-[#edf3f8] px-4 py-1.5 rounded-md border border-transparent focus-within:border-gray-400 focus-within:bg-white transition-all">
            <Search size={18} className="text-gray-500" />
            <input 
              type="text" 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters(null)}
              placeholder="Search by title, skills, or company" 
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 h-8 font-medium"
            />
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <MapPin size={18} className="text-gray-500" />
             <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="bg-transparent border-none outline-none text-sm text-gray-800 font-medium cursor-pointer"
              >
                <option value="">Any Location</option>
                {availableFilters.locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
            </select>
          </div>
          
          <button onClick={applyFilters} className="md:hidden p-2 text-primary">
            <Search size={22} />
          </button>
        </div>

        <div className="flex items-center gap-4 ml-4">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Premium Core</span>
            <span className="text-[13px] font-bold text-[#202124]">Aarika Pro</span>
          </div>
          <button className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={18} />
          </button>
        </div>
      </header>

      {/* Sub-header Filters */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-2 overflow-x-auto scrollbar-none hidden md:flex items-center gap-3">
        {['Remote', 'Full-time', 'Entry level', 'Contract'].map((item) => (
          <button 
            key={item} 
            className="px-4 py-1.5 rounded-full border border-gray-300 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-500 transition-all whitespace-nowrap"
          >
            {item}
          </button>
        ))}
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-[13px] font-bold text-primary hover:bg-primary/10 transition-all ml-auto">
          <Filter size={14} />
          All Filters
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Job List */}
        <div className="w-full md:w-[400px] lg:w-[480px] flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden shrink-0">
          <div className="px-4 py-4 border-b border-gray-100 bg-[#f9fafb]">
            <h2 className="text-[17px] font-bold text-[#202124]">Top job picks for you</h2>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Based on your neural mapping</p>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {loading && jobs.length === 0 ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={24} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-[#202124]">No jobs found</h3>
                  <p className="text-gray-500 text-sm">Adjust your filters and try again.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    className={`p-4 cursor-pointer transition-all border-l-4 hover:bg-[#f3f2ef]/50 ${
                      !isMobile && selectedJob?.id === job.id 
                      ? "bg-[#edf3f8] border-primary" 
                      : "bg-white border-transparent"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-sm">
                        {job.company?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-primary truncate hover:underline leading-tight underline-offset-2">
                          {job.title}
                        </h3>
                        <p className="text-[13px] text-[#202124] font-medium leading-tight mt-1">{job.company}</p>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">{job.location || 'Remote'}</p>
                        
                        <div className="flex items-center gap-2 mt-3 text-[11px] font-bold">
                          <span className="text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded">94% Neural Match</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{formatDate(job.postedDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination in list */}
                <div className="p-4 flex items-center justify-between bg-gray-50">
                   <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-20 transition-all"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-[12px] font-bold text-gray-500">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-20 transition-all rotate-180"
                  >
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Selected Job Detail (Desktop Only) */}
        {!isMobile && (
          <div className="flex-1 bg-white h-full overflow-hidden flex flex-col relative">
            {isDetailLoading && (
              <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 size={32} className="text-primary animate-spin" />
              </div>
            )}

            {!selectedJob && !isDetailLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-6 animate-bounce duration-[2000ms]">
                  <Briefcase size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[#202124] mb-2 tracking-tight">Access the Mission Hub</h3>
                <p className="text-gray-500 max-w-sm font-medium">Select a role from the list to view full strategic briefings, neural matches, and application portals.</p>
              </div>
            ) : selectedJob && (
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {/* 1. Header Information - Refined & Compact */}
                <div className="w-full bg-white border-b border-gray-100 p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                    <div className="flex gap-6 items-start">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-bold text-2xl shadow-sm shrink-0">
                        {selectedJob.company?.charAt(0)}
                      </div>
                      <div className="space-y-2 max-w-2xl">
                        <h1 className="text-xl md:text-2xl font-bold text-[#202124] leading-tight tracking-tight">
                          {selectedJob.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-gray-500">
                          <span className="text-primary hover:underline cursor-pointer">{selectedJob.company}</span>
                          <span className="opacity-30">•</span>
                          <span>{selectedJob.location || 'Remote'}</span>
                          <span className="opacity-30">•</span>
                          <span>{formatDate(selectedJob.postedDate)}</span>
                          <span className="opacity-30">•</span>
                          <span className="text-emerald-600 font-bold">12 applicants</span>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-3">
                          <button 
                            onClick={() => window.open(selectedJob.link, '_blank')}
                            className="px-6 py-2 bg-primary text-white font-bold text-[14px] rounded-full hover:bg-blue-600 shadow-md shadow-primary/10 transition-all flex items-center gap-2"
                          >
                            <Zap size={14} fill="currentColor" /> Apply
                          </button>
                          <button className="px-5 py-2 border border-gray-300 text-[#202124] font-bold text-[14px] rounded-full hover:bg-gray-50 transition-all flex items-center gap-2">
                             <Bookmark size={14} /> Save
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl shrink-0">
                      <div className="flex items-center gap-3">
                        <Trophy size={16} className="text-emerald-600" />
                        <div>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider leading-none mb-0.5">Neural Match</p>
                          <p className="text-[14px] font-bold text-emerald-700 leading-none">94% Strategic</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Content Section - Refined Pro Layout */}
                <div className="p-6 md:p-8 space-y-8 bg-white min-h-screen">
                  {/* Briefing Section */}
                  <section className="bg-[#f9fafb]/50 p-6 md:p-8 rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-5 bg-primary rounded-full" />
                      <h2 className="text-lg font-bold text-[#202124]">Role Strategic Briefing</h2>
                    </div>
                    <div className="text-[#3c4043] leading-relaxed text-[15px] font-medium opacity-90">
                      <div className="prose prose-sm max-w-none prose-slate whitespace-pre-line break-words">
                        {selectedJob.description}
                      </div>
                    </div>
                  </section>

                  {/* Requirements Section */}
                  {selectedJob.requirements && (
                    <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-5 bg-[#202124] rounded-full" />
                        <h2 className="text-lg font-bold text-[#202124]">Requirements Matrix</h2>
                      </div>
                      <div className="text-[#3c4043] leading-relaxed text-[14px] font-medium opacity-80">
                        <div className="prose prose-sm max-w-none prose-slate whitespace-pre-line break-words">
                           {selectedJob.requirements}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Meta & Organization Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Summary Metrics</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "Tier", value: selectedJob.experience || "Senior", icon: <Trophy size={14} /> },
                          { label: "Environment", value: selectedJob.employmentType || "Remote", icon: <Globe size={14} /> },
                          { label: "Compensation", value: selectedJob.jobSalary || "$120k+", icon: <DollarSign size={14} /> },
                          { label: "Stability", value: "Permanent", icon: <Clock size={14} /> }
                        ].map((item, index) => (
                          <div key={index} className="flex flex-col gap-1 p-3 bg-gray-50/50 rounded-xl border border-gray-50">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                             <span className="text-[13px] font-bold text-[#202124]">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#202124] text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary backdrop-blur-md shrink-0">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">Organization</span>
                            <h4 className="text-[15px] font-bold leading-tight">{selectedJob.company}</h4>
                          </div>
                        </div>
                        
                        <p className="text-white/60 text-[13px] leading-relaxed mb-6 italic">
                          "{selectedJob.companyDescription || 'Global Innovation Specialist.'}"
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => window.open(selectedJob.companyWebsite, '_blank')} 
                        className="w-full py-2.5 bg-white text-[#202124] rounded-xl text-[13px] font-bold hover:bg-primary hover:text-white transition-all relative z-10"
                      >
                        Company Profile
                      </button>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile Footer for pagination if mobile */}
      {isMobile && !loading && jobs.length > 0 && (
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-50">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-bold disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-800">{pagination.page} / {pagination.totalPages}</span>
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold disabled:opacity-30"
            >
              Next
            </button>
         </div>
      )}
    </div>
  );
};

export default Jobs;
