import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, Menu } from "lucide-react";
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
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch jobs with current filters and pagination
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

      // Extract unique locations and employment types for filters
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

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [pagination.page, pagination.limit]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchJobs();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      location: "",
      employmentType: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchJobs();
  };

  // Handle pagination
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className={`min-h-screen w-full overflow-y-auto md:w-[90vw]`}>
      {/* Mobile Header */}
      <div className="mobile-header md:hidden">
        <button
          className="mobile-back-button"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft size={24} />
        </button>

        <button className="mobile-more-button" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-8 text-white`}>
          Find Your Dream Job
        </h1>

        {/* Filters Section */}
        <div className={`bg-white/5 rounded-lg shadow-md p-6 mb-8`}>
          <form
            onSubmit={applyFilters}
            className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4"
          >
            <div>
              <label
                htmlFor="search"
                className={`block text-sm font-medium text-gray-300 mb-1`}
              >
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Job title, company, skills..."
                className={`w-full px-4 py-2 border border-gray-600 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className={`block text-sm font-medium text-gray-300 mb-1`}
              >
                Location
              </label>
              <select
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className={`w-full px-4 py-2 border border-gray-600 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-blue-500`}
              >
                <option value="" className={`bg-white/5 text-white`}>
                  All Locations
                </option>
                {availableFilters.locations.map((location, index) => (
                  <option
                    key={index}
                    value={location}
                    className={`bg-gray-700 text-white}`}
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="employmentType"
                className={`block text-sm font-medium text-gray-300 mb-1`}
              >
                Job Type
              </label>
              <select
                id="employmentType"
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className={`w-full px-4 py-2 border border-gray-600 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-blue-500`}
              >
                <option value="" className={`bg-white/5 text-white`}>
                  All Types
                </option>
                {availableFilters.employmentTypes.map((type, index) => (
                  <option
                    key={index}
                    value={type}
                    className={`bg-gray-700 text-white`}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300`}
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className={`px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-md transition-colors duration-300`}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500`}
            ></div>
          </div>
        ) : error ? (
          <div
            className={`bg-red-900 border-red-700 text-red-200 border px-4 py-3 rounded-md mb-4`}
          >
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className={`bg-white/5 rounded-lg shadow-md p-8 text-center`}>
            <h3 className={`text-xl font-medium text-gray-300`}>
              No jobs found
            </h3>
            <p className={`text-gray-400 mt-2`}>
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-white/5 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-lg font-semibold text-white mb-1`}>
                          {job.title}
                        </h3>
                        <p className={`text-gray-300 mb-2`}>{job.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 mb-4">
                      {job.location && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200`}
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {job.location}
                        </span>
                      )}
                      {job.employmentType && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200`}
                        >
                          {job.employmentType}
                        </span>
                      )}
                    </div>

                    <p className={`text-gray-400 text-sm line-clamp-3 mb-4`}>
                      {job.description?.substring(0, 150)}
                      {job.description?.length > 150 ? "..." : ""}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <Link
                        to={`/job/${job.id}`}
                        className={`text-blue-400 hover:text-blue-300 font-medium text-sm`}
                      >
                        View Details
                      </Link>

                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300`}
                        >
                          Apply Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-4 py-2 mr-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
            >
              Previous
            </button>
            <span
              className={`px-4 py-2 bg-gray-800 border-gray-600 text-white  xt-gray-800'} border rounded-md`}
            >
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-4 py-2 ml-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
