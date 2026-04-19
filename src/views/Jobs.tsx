"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, Search, MapPin, Briefcase, X, ChevronRight, Filter, Menu, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const Jobs = () => {
  const { toggleSidebar } = useAuth();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    employmentType: "",
  });
  const [availableFilters, setAvailableFilters] = useState({
    locations: [],
    employmentTypes: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchJobs = async () => {
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

      setJobs(response.data.jobs);
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

      setError(null);
    } catch (err) {
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

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, pagination.limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
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

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

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
            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">Jobs Board</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-0 pt-0 pb-20">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate.push("/chat")}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="text-primary font-semibold text-[13px] tracking-tight">Mission Board</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-medium text-[#202124] tracking-tight mb-2">
              Find your next <span className="gemini-gradient-text">strategic role</span>
            </h1>
            <p className="text-[#444746] text-sm md:text-lg opacity-80">
              Personalized job matches based on your neural career mapping.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border border-gray-100 rounded-[28px] p-2 mb-12 shadow-sm animate-in fade-in zoom-in-95 duration-700">
          <form onSubmit={applyFilters} className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-[24px] transition-colors group">
              <Search size={20} className="text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Job title or keywords"
                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#202124] placeholder-gray-400 font-normal outline-none"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-100" />

            <div className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-[24px] transition-colors group">
              <MapPin size={20} className="text-gray-400 group-focus-within:text-primary transition-colors" />
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#202124] font-normal outline-none appearance-none cursor-pointer"
              >
                <option value="">Any Location</option>
                {availableFilters.locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-primary text-white rounded-[24px] px-8 py-3.5 font-medium text-[15px] transition-all hover:bg-blue-600 active:scale-95 shadow-md shadow-primary/20"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="p-3.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </form>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-[28px] bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white border border-red-50 rounded-[28px]">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-20 text-center bg-white border border-gray-100 rounded-[28px] animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase size={24} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-medium text-[#202124] mb-2">No missions found.</h3>
            <p className="text-[#444746] opacity-70">Try adjusting your filters to find more relevant roles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-1000">
            {jobs.map((job, idx) => (
              <div
                key={job.id}
                onClick={() => navigate.push(`/job/detail/?id=${job.id}`)}
                className="premium-card p-6 flex flex-col cursor-pointer hover:border-primary/30"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl font-bold text-primary">
                    {job.company?.charAt(0)}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">94% Match</span>
                  </div>
                </div>

                <h3 className="text-[19px] font-semibold text-[#202124] mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-[#444746] text-[15px] mb-4">{job.company}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-[12px] text-[#444746]">
                    <MapPin size={12} className="text-gray-400" />
                    {job.location || "Remote"}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-[12px] text-[#444746]">
                    <Briefcase size={12} className="text-gray-400" />
                    {job.employmentType || "Full-time"}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[14px] font-semibold text-[#202124]">$120k - $160k</span>
                  <div className="text-primary group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <div className="flex justify-center mt-16 pb-12">
            <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-20 transition-all active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="px-4 text-[14px] font-medium text-[#202124]">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-20 transition-all active:scale-95 rotate-180"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
