"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { 
  ArrowLeft, Search, MapPin, Briefcase, X, ChevronRight, 
  Filter, Menu, User, Bookmark, ExternalLink, Building2, 
  DollarSign, Loader2, Trophy, Globe, Clock, CheckCircle2, Zap, Shield 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const OpenJobs = () => {
  const { toggleSidebar, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibility, setEligibility] = useState<any>({ canApply: true, message: "", lowProficiencySkills: [], notAttemptedSkills: [] });
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate.replace("/jobs");
    }
  }, [isAuthenticated, authLoading, navigate]);



  const fetchJobs = async (initial = false) => {
    try {
      setLoading(true);
      const { search, location, employmentType } = filters;
      const { page, limit } = pagination;

      const response = await axiosInstance.get("/open-jobs", {
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
      setEligibility(response.data.eligibility);
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

      // Remove automatic selection since we use a grid now

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

  const handleApplyClick = async (e: React.MouseEvent, job: any) => {
    e.stopPropagation(); // Prevent card click
    if (!job?.link) return;
    
    if (!isAuthenticated) {
      navigate.push(`/?returnUrl=/jobs`);
      return;
    }

    setApplyingJobId(job.id);
    try {
      await axiosInstance.post(`/jobs/${job.id}/apply`);
      
      if (job.link.includes('aarika.ai')) {
        toast({
          title: "Application Submitted",
          description: "Your application has been received successfully.",
        });
      } else {
        window.open(job.link, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error tracking application:', err);
    } finally {
      setApplyingJobId(null);
    }
  };

  useEffect(() => {
    fetchJobs(true);
  }, []);

  useEffect(() => {
    if (pagination.page !== 1) fetchJobs();
  }, [pagination.page]);

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
    navigate.push(`/job/detail/?id=${job.id}`);
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

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl md:text-2xl font-bold text-[#202124]">Recommended for you</h2>
             <span className="text-sm font-medium text-gray-500">{pagination.total} opportunities</span>
          </div>

          {loading && jobs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm">
                   <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4" />
                   <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                   <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
                   <div className="h-10 bg-gray-100 rounded-xl w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[#202124] mb-2">No jobs found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">We couldn't find any positions matching your current criteria. Try adjusting your filters or expanding your search.</p>
                <button onClick={resetFilters} className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-all">
                  Reset Filters
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col relative group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-bold text-2xl shadow-sm">
                      {job.company?.charAt(0)}
                    </div>
                    <button className="text-gray-400 hover:text-primary transition-colors p-2" onClick={(e) => { e.stopPropagation(); /* Bookmark logic */ }}>
                      <Bookmark size={20} />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#202124] leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-[14px] text-gray-600 font-medium mb-4">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                      <MapPin size={12} /> {job.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                      <DollarSign size={12} /> {job.jobSalary || 'Competitive'}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {formatDate(job.postedDate)}
                    </span>
                    <button 
                      onClick={(e) => handleApplyClick(e, job)}
                      disabled={applyingJobId === job.id}
                      className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {applyingJobId === job.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {jobs.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-gray-800">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenJobs;
