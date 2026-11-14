"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { Search, MapPin, Briefcase, DollarSign, Loader2, Clock, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicPage, SectionLabel, serif } from "@/components/landing/Site";
import { useToast } from "@/hooks/use-toast";

const OpenJobs = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useRouter();
  const searchParams = useSearchParams();
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

      // A failed or non-JSON response used to crash the page; treat it as "no jobs".
      const data = response.data && typeof response.data === "object" ? response.data : {};
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      if (data.eligibility) setEligibility(data.eligibility);
      setPagination({
        ...pagination,
        total: data.pagination?.total ?? 0,
        totalPages: data.pagination?.totalPages ?? 0,
      });

      if (data.filters) {
        setAvailableFilters({
          locations: data.filters.locations || [],
          employmentTypes: data.filters.employmentTypes || [],
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
      navigate.push("/login");
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

  const selectClass =
    "h-11 w-full appearance-none rounded-full bg-white px-4 text-[14px] text-[#141413] outline-none ring-1 ring-inset ring-black/[0.1] focus:ring-[#2f5fe8]";

  return (
    <PublicPage>
      {/* Heading + search */}
      <section aria-labelledby="jobs-title" className="border-b border-black/[0.06] bg-[#f6f5f0]">
        <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16">
          <SectionLabel>Open jobs</SectionLabel>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1 id="jobs-title" className={`${serif} text-[40px] leading-[1.05] tracking-[-0.015em] sm:text-[56px]`}>
              Jobs you can apply to today.
            </h1>
            {pagination.total > 0 && (
              <p className="text-[14px] text-[#5f5e5a] sm:pb-2">{pagination.total.toLocaleString("en-IN")} open roles</p>
            )}
          </div>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#5f5e5a]">
            Browse without an account. Sign up to see the roles that match your profile and let Smart Apply prepare each application.
          </p>

          <form onSubmit={applyFilters} className="mt-8 grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
            <label className="relative block">
              <span className="sr-only">Search jobs</span>
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#77756e]" aria-hidden />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Title, skill or company"
                className="h-11 w-full rounded-full bg-white pl-11 pr-4 text-[14px] text-[#141413] outline-none ring-1 ring-inset ring-black/[0.1] placeholder:text-[#77756e] focus:ring-[#2f5fe8]"
              />
            </label>
            <div className="grid grid-cols-2 gap-2.5 lg:contents">
              <label className="block">
                <span className="sr-only">Location</span>
                <select name="location" value={filters.location} onChange={handleFilterChange} className={selectClass}>
                  <option value="">Any location</option>
                  {availableFilters.locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="sr-only">Job type</span>
                <select name="employmentType" value={filters.employmentType} onChange={handleFilterChange} className={selectClass}>
                  <option value="">Any job type</option>
                  {availableFilters.employmentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#141413] px-6 text-[14px] font-medium text-white transition-colors hover:bg-black/80"
            >
              <Search size={15} aria-hidden />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section aria-label="Job results" className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-16">
        {loading && jobs.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-[20px] bg-[#f6f5f0]" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-[20px] bg-[#f6f5f0] px-6 py-16 text-center">
            <Briefcase size={28} className="mx-auto text-[#77756e]" aria-hidden />
            <h2 className="mt-4 text-[20px] font-medium">{error ? "Couldn't load jobs right now" : "No jobs found"}</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-[#5f5e5a]">
              {error ? "Please try again in a moment." : "Try a different title or location, or clear the filters."}
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 rounded-full px-5 py-2.5 text-[14px] font-medium ring-1 ring-inset ring-black/15 transition-colors hover:bg-white"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="group flex cursor-pointer flex-col rounded-[20px] bg-white p-6 ring-1 ring-inset ring-black/[0.08] transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(20,20,40,0.35)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f6f5f0] text-[18px] font-semibold text-[#2f5fe8]">
                    {job.company?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-[17px] font-medium leading-snug transition-colors group-hover:text-[#2f5fe8]">{job.title}</h3>
                    <p className="mt-1 truncate text-[14px] text-[#5f5e5a]">{job.company}</p>
                  </div>
                </div>
                <div className="mb-6 mt-5 flex flex-wrap gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f5f0] px-3 py-1 text-[#3d3c39]">
                    <MapPin size={13} aria-hidden /> {job.location || "Remote"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f4ea] px-3 py-1 text-[#1f7a55]">
                    <DollarSign size={13} aria-hidden /> {job.jobSalary || "Competitive"}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-[#77756e]">
                    <Clock size={13} aria-hidden /> {formatDate(job.postedDate)}
                  </span>
                  <button
                    onClick={(e) => handleApplyClick(e, job)}
                    disabled={applyingJobId === job.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#2f5fe8] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#2550d0]"
                  >
                    {applyingJobId === job.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" aria-hidden />}
                    Apply
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {jobs.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="rounded-full px-5 py-2.5 text-[14px] font-medium ring-1 ring-inset ring-black/15 transition-colors hover:bg-black/[0.03] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-[14px] text-[#5f5e5a]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="rounded-full px-5 py-2.5 text-[14px] font-medium ring-1 ring-inset ring-black/15 transition-colors hover:bg-black/[0.03] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </PublicPage>
  );
};

export default OpenJobs;
