"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Search, MapPin, Briefcase, Filter, Menu, User, Bookmark, Building2,
  Loader2, Trophy, Globe, Clock, Zap, Shield, DollarSign, CheckCircle2, IndianRupee, X,
  ChevronDown, SlidersHorizontal, Wifi, Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const Jobs = () => {
  const { toggleSidebar } = useAuth();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [eligibility, setEligibility] = useState<any>({ canApply: true, message: "", lowProficiencySkills: [], notAttemptedSkills: [] });

  // Selection State
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchJobs = async (overridePage?: number) => {
    try {
      setLoading(true);
      const { search, location, employmentType } = filters;
      const pageToFetch = overridePage || pagination.page;
      const { limit } = pagination;

      const response = await axiosInstance.get("/jobs/company-listings", {
        params: {
          page: pageToFetch,
          limit,
          search,
          location,
          employmentType,
        },
      });

      const fetchedJobs = response.data.jobs;
      setJobs(fetchedJobs);
      setIsPersonalized(!!response.data.isPersonalized);
      setHasResume(!!response.data.hasResume);
      setEligibility({ canApply: true, message: "", lowProficiencySkills: [], notAttemptedSkills: [] });
      setPagination((prev) => ({
        ...prev,
        page: pageToFetch,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));

      if (response.data.filters) {
        setAvailableFilters({
          locations: response.data.filters.locations || [],
          employmentTypes: response.data.filters.employmentTypes || [],
        });
      }

      // Bug #12 fix: only auto-select first job when no job is already selected.
      // Previously, every fetchJobs call (including page changes) would override the user's selection.
      if (!isMobile && fetchedJobs.length > 0 && !selectedJob) {
        fetchJobDetail(fetchedJobs[0].id);
      }

      setError(null);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      if (err.response?.status === 404) {
        setJobs([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
      }
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load jobs. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (filters.search.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axiosInstance.get(`/jobs/suggestions?q=${encodeURIComponent(filters.search)}`);
        if (response.data.success) {
          setSuggestions(response.data.suggestions);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        searchInputRef.current && !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchJobDetail = async (id: string) => {
    if (!id) return;
    try {
      setIsDetailLoading(true);
      setHasApplied(false);
      const response = await axiosInstance.get(`/jobs/company-listings/${id}`);
      setSelectedJob(response.data.job);
      try {
        const statusRes = await axiosInstance.get(`/jobs/company-listings/${id}/apply-status`);
        if (statusRes.data.hasApplied) setHasApplied(true);
      } catch {
        // silent — not critical
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob || hasApplied || applying) return;
    
    if (!selectedJob.isCompanyJob && selectedJob.link) {
      window.open(selectedJob.link, "_blank");
      return;
    }

    setApplying(true);
    try {
      await axiosInstance.post(`/company/jobs/${selectedJob.id}/apply-aarika`);
      setHasApplied(true);
      toast.success("Applied successfully!");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setHasApplied(true);
      } else {
        toast.error(err?.response?.data?.message || "Failed to submit application. Please try again.");
      }
    } finally {
      setApplying(false);
    }
  };

  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      fetchJobs(1);
      return;
    }
    const timer = setTimeout(() => {
      fetchJobs(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search, filters.location, filters.employmentType]);

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = (e: any) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    fetchJobs(1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters((prev) => ({ ...prev, search: suggestion }));
    setShowSuggestions(false);
    // Note: useEffect for filters will trigger fetchJobs automatically
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      location: "",
      employmentType: "",
    });
    // the useEffect will auto-trigger fetchJobs(1) when filters state changes
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchJobs(newPage);
    }
  };

  const handleJobClick = (job: any) => {
    if (isMobile) {
      navigate.push(`/job/detail/?id=${job.id}&source=company`);
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

  // Quick filter pills
  const quickFilters = [
    { label: "Remote", value: "Remote" },
    { label: "Full-time", value: "Full-time" },
    { label: "Internship", value: "Internship" },
    { label: "Contract", value: "Contract" },
    { label: "Part-time", value: "Part-time" },
  ];

  const toggleQuickFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      employmentType: prev.employmentType === value ? "" : value,
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f3f2ef] relative overflow-hidden">

      {/* ── TOP HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">

        {/* Row 1: logo / search / profile */}
        <div className="flex items-center gap-3 px-3 md:px-5 py-2.5">

          {/* Sidebar toggle + brand */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="hidden md:block text-[13px] font-bold text-primary tracking-tight">Aarika.AI</span>
          </div>

          {/* Mobile page title */}
          {!isMobileSearchOpen && (
            <h2 className="md:hidden text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[110px] sm:max-w-none">
              Mission Hunt
            </h2>
          )}

          {/* Mobile Search bar — LinkedIn pill style */}
          {isMobileSearchOpen ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex-1 min-w-0 flex items-center gap-1.5 bg-[#edf3f8] px-2.5 py-1.5 rounded-lg border border-primary/20 relative">
                <Search size={15} className="text-primary shrink-0" />
                <input
                  ref={(el) => { if (el) el.focus(); }}
                  type="text" name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') { applyFilters(null); setIsMobileSearchOpen(false); } }}
                  placeholder="Search jobs, skills..."
                  className="w-full min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm text-gray-800 font-medium"
                  autoComplete="off"
                />
                {filters.search && (
                  <button onClick={() => setFilters((p) => ({ ...p, search: "" }))} className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0">
                    <X size={14} />
                  </button>
                )}
                {suggestions.length > 0 && (
                  <div ref={dropdownRef} className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden py-1 max-h-[240px] overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <div key={i} className="px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary cursor-pointer flex items-center gap-2"
                        onClick={() => { handleSuggestionClick(s); setIsMobileSearchOpen(false); }}>
                        <Search size={12} className="text-gray-400 shrink-0" /><span className="truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setIsMobileSearchOpen(false)}
                className="px-2.5 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shrink-0">Cancel</button>
            </div>
          ) : (
            <>
              {/* Desktop search pill */}
              <div className="hidden md:flex flex-1 max-w-xl items-center bg-[#edf3f8] rounded-full border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(10,102,194,0.15)] transition-all relative">
                <div className="flex items-center flex-1 px-4 py-2 gap-2">
                  <Search size={16} className="text-gray-500 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text" name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(null); }}
                    placeholder="Search jobs, skills, companies..."
                    className="w-full bg-transparent border-none outline-none text-sm text-gray-700 font-medium placeholder:text-gray-400"
                    autoComplete="off"
                  />
                  {filters.search && (
                    <button onClick={() => setFilters((p) => ({ ...p, search: "" }))} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={14} /></button>
                  )}
                </div>

                <div className="h-5 w-px bg-gray-300 shrink-0" />

                <div className="flex items-center gap-1 px-3 py-2 cursor-pointer hover:bg-white/60 rounded-r-full transition-colors shrink-0">
                  <MapPin size={14} className="text-gray-500" />
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="bg-transparent border-none outline-none text-sm text-gray-700 font-medium cursor-pointer max-w-[120px] appearance-none"
                  >
                    <option value="">Any Location</option>
                    {availableFilters.locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="text-gray-400 shrink-0" />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div ref={dropdownRef} className="absolute top-[calc(100%+10px)] left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-[100] overflow-hidden py-2 max-h-[300px] overflow-y-auto">
                    <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suggestions</p>
                    {suggestions.map((s, i) => (
                      <div key={i}
                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={() => handleSuggestionClick(s)}>
                        <Search size={13} className="text-gray-400 shrink-0" />
                        <span className="font-medium truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right cluster */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
                {/* Mobile search icon */}
                <button onClick={() => setIsMobileSearchOpen(true)}
                  className="md:hidden p-1.5 sm:p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full transition-colors">
                  <Search size={18} />
                </button>

                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Premium Core</span>
                  <span className="text-[13px] font-bold text-[#202124] leading-tight">Aarika Pro</span>
                </div>

                <button
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm shrink-0"
                  onClick={() => navigate.push("/profile")}>
                  <User size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Row 2: Quick filter pills (LinkedIn-style) */}
        <div className="flex items-center gap-2 px-3 md:px-5 pb-2.5 overflow-x-auto scrollbar-none">
          {quickFilters.map((f) => {
            const active = filters.employmentType === f.value;
            return (
              <button
                key={f.value}
                onClick={() => toggleQuickFilter(f.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[12px] font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#dce6f1] border-blue-400 text-[#0a66c2] shadow-[0_0_0_1px_rgba(10,102,194,0.35)]"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                {active && <CheckCircle2 size={11} className="shrink-0" />}
                {f.label}
              </button>
            );
          })}

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 mx-1 shrink-0" />

          {/* All Filters CTA */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-300 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-400 whitespace-nowrap transition-all ml-auto shrink-0"
          >
            <SlidersHorizontal size={13} />
            {(filters.search || filters.location || filters.employmentType) ? "Clear Filters" : "All Filters"}
          </button>
        </div>
      </header>

      {/* ── BODY ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT PANE: Job List ──────────────────────────────────── */}
        <div className="w-full md:w-[380px] lg:w-[460px] flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden shrink-0">

          {/* List header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-white">
            {isPersonalized ? (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-[#202124]">Top picks for you</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm">
                      <Star size={8} fill="currentColor" /> AI Personalized
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-500 font-semibold mt-0.5">
                    {hasResume ? "✓ Matched to your resume" : "✓ Matched to your profile"}
                  </p>
                </div>
                <span className="text-[11px] text-gray-400 font-medium shrink-0">{pagination.total} jobs</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[#202124]">Top job picks for you</h2>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Based on your profile</p>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{pagination.total} jobs</span>
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {(filters.search || filters.location || filters.employmentType) && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-[#f8f9fa] border-b border-gray-100 overflow-x-auto scrollbar-none">
              {filters.employmentType && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[#dce6f1] text-[#0a66c2] text-[11px] font-bold rounded-full border border-blue-200 whitespace-nowrap">
                  {filters.employmentType}
                  <button onClick={() => setFilters((p) => ({ ...p, employmentType: "" }))} className="hover:text-blue-800">
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.location && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full border border-gray-200 whitespace-nowrap">
                  <MapPin size={9} /> {filters.location}
                  <button onClick={() => setFilters((p) => ({ ...p, location: "" }))} className="hover:text-gray-800">
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full border border-gray-200 whitespace-nowrap">
                  <Search size={9} /> &ldquo;{filters.search}&rdquo;
                  <button onClick={() => setFilters((p) => ({ ...p, search: "" }))} className="hover:text-gray-800">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Job cards */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {loading && jobs.length === 0 ? (
              <div className="space-y-0 divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-4 flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={22} className="text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-[#202124]">No jobs found</h3>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
                <button onClick={resetFilters} className="mt-4 px-4 py-1.5 text-xs font-bold text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-all">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    className={`p-4 cursor-pointer transition-all border-l-[3px] group ${
                      !isMobile && selectedJob?.id === job.id
                        ? "bg-[#edf3f8] border-[#0a66c2]"
                        : "bg-white border-transparent hover:bg-[#f9fafb] hover:border-gray-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Company logo / initial */}
                      <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" onError={(e: any) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                        ) : null}
                        <span className={`${job.companyLogo ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-primary font-bold text-lg uppercase`}>
                          {job.company?.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-[14px] font-bold leading-snug truncate transition-colors ${
                          !isMobile && selectedJob?.id === job.id ? "text-[#0a66c2]" : "text-[#202124] group-hover:text-[#0a66c2]"
                        }`}>
                          {job.title}
                        </h3>
                        <p className="text-[12px] text-gray-600 font-medium leading-tight mt-0.5 truncate">{job.company}</p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1 truncate">
                          <MapPin size={10} className="shrink-0" />{job.location || 'Remote'}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center flex-wrap gap-1.5 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            job.employmentType?.toLowerCase().includes('remote')
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : job.employmentType?.toLowerCase().includes('intern')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-green-50 text-green-700 border-green-100'
                          }`}>
                            {job.employmentType || 'Full-time'}
                          </span>

                          {job.department && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100 truncate max-w-[100px]">{job.department}</span>
                          )}

                          <span className="text-[10px] text-gray-400 font-medium ml-auto shrink-0">{formatDate(job.postedDate)}</span>
                        </div>

                        {/* Match badge */}
                        {isPersonalized && job.matchPercentage != null && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    job.matchPercentage >= 75 ? 'bg-green-500' :
                                    job.matchPercentage >= 50 ? 'bg-amber-400' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${job.matchPercentage}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-bold shrink-0 ${
                                job.matchPercentage >= 75 ? 'text-green-600' :
                                job.matchPercentage >= 50 ? 'text-amber-600' : 'text-gray-400'
                              }`}>{job.matchPercentage}% match</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="p-3 flex items-center justify-between bg-[#f9fafb] border-t border-gray-100">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-gray-600 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-all"
                  >
                    <ArrowLeft size={13} /> Prev
                  </button>
                  <span className="text-[12px] font-bold text-gray-500">{pagination.page} / {pagination.totalPages || 1}</span>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-gray-600 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-all"
                  >
                    Next <ArrowRight size={13} />
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

                        <div className="w-full">
                          <div className="flex flex-wrap items-center gap-3 pt-3 w-full">
                            {hasApplied ? (
                              <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-400 text-emerald-600 font-bold text-[14px] rounded-full flex items-center justify-center gap-2 whitespace-nowrap">
                                <CheckCircle2 size={14} className="text-emerald-500" /> Applied
                              </div>
                            ) : eligibility?.canApply ? (
                              <button
                                onClick={handleApply}
                                disabled={applying}
                                className="px-6 py-2 bg-primary text-white font-bold text-[14px] rounded-full hover:bg-blue-600 shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
                              >
                                {applying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />} Apply
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate.push("/chat")}
                                className="px-5 py-2 bg-gray-200 text-gray-500 font-bold text-[13px] rounded-full cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                                title={eligibility?.message}
                              >
                                <Shield size={14} /> Improve Skills
                              </button>
                            )}
                            <button
                              onClick={() => navigate.push(`/job/${selectedJob.id}/opportunity`)}
                              className="px-5 py-2 bg-purple-600 text-white font-bold text-[14px] rounded-full hover:bg-purple-700 shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                            >
                              <Trophy size={14} /> Analyze
                            </button>
                            <button className="px-5 py-2 border border-gray-300 text-[#202124] font-bold text-[14px] rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0">
                              <Bookmark size={14} /> Save
                            </button>
                          </div>
                          {!eligibility?.canApply && eligibility?.message && (
                            <p className="text-[11px] text-red-500 font-bold max-w-[250px] leading-tight truncate mt-2">
                              {eligibility?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl shrink-0">
                      <div className="flex items-center gap-3">
                        <Trophy size={16} className="text-emerald-600" />
                        <div>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider leading-none mb-0.5">Employment Type</p>
                          <p className="text-[14px] font-bold text-emerald-700 leading-none">
                            {selectedJob.employmentType || 'Full-time'}
                          </p>
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
                        <ReactMarkdown>{selectedJob.description}</ReactMarkdown>
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
                          <ReactMarkdown>{selectedJob.requirements}</ReactMarkdown>
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
                          {
                            label: "Compensation",
                            value: selectedJob.jobSalary || "$120k+",
                            icon: selectedJob.jobSalary?.includes("₹") ? (
                              <IndianRupee size={14} />
                            ) : (
                              <DollarSign size={14} />
                            )
                          },
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pl-16 pr-4 py-3 flex items-center justify-between z-40 shadow-lg">
          <button
            onClick={() => changePage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3.5 py-2 rounded-full bg-gray-100 text-gray-700 text-xs font-bold disabled:opacity-30 active:scale-95 transition-all"
          >
            Previous
          </button>
          <span className="text-xs font-extrabold text-gray-800 tracking-tight">{pagination.page} / {pagination.totalPages}</span>
          <button
            onClick={() => changePage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold disabled:opacity-30 active:scale-95 transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
