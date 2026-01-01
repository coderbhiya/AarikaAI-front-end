import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, Menu, Search, MapPin, Briefcase, Filter, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Jobs = () => {
  const { toggleSidebar } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
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
    <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-20">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full" />
      </div>

      <div className="container max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/chat")}
              className="p-2.5 rounded-xl glass-button text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-primary font-bold tracking-widest uppercase text-xs">Opportunities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Curated <span className="perplexity-gradient-text">Role Recommendations</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            AI-driven job matching tailored to your unique skill set and career aspirations.
          </p>
        </div>

        {/* Filters Section */}
        <div className="glass-card rounded-3xl p-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Search size={14} className="text-primary" /> Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Title or skills..."
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-2xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Location
              </label>
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-2xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">Worldwide</option>
                {availableFilters.locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-zinc-900">{loc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={14} className="text-primary" /> Type
              </label>
              <select
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-2xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {availableFilters.employmentTypes.map((type) => (
                  <option key={type} value={type} className="bg-zinc-900">{type}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-6 py-3 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="p-3 bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/[0.02] border border-white/[0.05] shimmer" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-200 text-center">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-20 text-center glass-card rounded-3xl">
            <Briefcase size={48} className="mx-auto text-gray-600 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No matching roles found</h3>
            <p className="text-gray-400">Try broadening your search criteria or checking back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32 animate-in fade-in duration-1000">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8 hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
              >
                <div className="mb-6 flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                    <span className="text-gray-400 font-bold text-xl">{job.company?.charAt(0)}</span>
                  </div>
                  {job.employmentType && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
                      {job.employmentType}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-400 font-medium mb-4">{job.company}</p>

                <div className="flex items-center gap-4 mb-6">
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <MapPin size={12} className="text-primary" />
                      {job.location}
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-8">
                  {job.description}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <Link
                    to={`/job/${job.id}`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Details
                  </Link>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                  >
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-1 p-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-3 text-gray-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="px-5 text-sm font-bold text-white border-x border-white/10">
                {pagination.page} <span className="text-gray-600 font-medium mx-1">of</span> {pagination.totalPages}
              </div>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-3 text-gray-400 hover:text-white disabled:opacity-30 transition-all rotate-180"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
