import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

const JobDetail = () => {
  const { id } = useParams();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  // Fetch job details
  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/jobs/${id}`);
      setJob(response.data.job);
      setError(null);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  // Handle apply action
  const handleApply = async () => {
    if (!job?.link) return;
    
    setApplying(true);
    try {
      // Track application (optional API call)
      await axiosInstance.post(`/jobs/${id}/apply`);
    } catch (err) {
      console.error('Error tracking application:', err);
    } finally {
      setApplying(false);
      // Open external link
      window.open(job.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-900`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen bg-gray-900`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`bg-red-100 border-red-400 text-red-700 border px-6 py-4 rounded-lg mb-6`}>
            <h3 className="font-semibold mb-2">Error Loading Job</h3>
            <p>{error}</p>
            <div className="mt-4 space-x-3">
              <button
                onClick={fetchJobDetail}
                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors`}
              >
                Try Again
              </button>
              <Link
                to="/dashboard/jobs"
                className={`px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors`}
              >
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className={`min-h-screen bg-gray-900`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`bg-white rounded-lg shadow-md p-8 text-center`}>
            <h2 className={`text-2xl font-bold text-gray-800 mb-4`}>
              Job Not Found
            </h2>
            <p className={`text-gray-600 mb-6`}>
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/dashboard/jobs"
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors`}
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-y-auto`}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link
              to="/dashboard/jobs"
              className={`text-blue-600 hover:text-blue-700 transition-colors`}
            >
              Jobs
            </Link>
            <span className={`text-gray-400`}>/</span>
            <span className={`text-gray-600`}>
              {job.title}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className={`bg-gray-900 text-white rounded-lg shadow-md p-8 mb-6`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div className="flex-1">
                  <h1 className={`text-3xl font-bold text-white mb-2`}>
                    {job.title}
                  </h1>
                  <p className={`text-xl text-gray-600 mb-4`}>
                    {job.company}
                  </p>
                  
                  {/* Job Tags */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {job.location && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800`}>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800`}>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {job.employmentType}
                      </span>
                    )}
                    {(job.jobSalary || job.jobMinSalary || job.jobMaxSalary) && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800`}>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        {job.jobSalary || job.jobMinSalary || job.jobMaxSalary || 'Salary not specified'}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Apply Button */}
                <div className="mt-4 md:mt-0 md:ml-6">
                  {job.link ? (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className={`w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {applying ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Applying...
                        </span>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  ) : (
                    <span className={`px-8 py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold`}>
                      Application Closed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className={`bg-gray-900 text-white rounded-lg shadow-md p-8 mb-6`}>
              <h2 className={`text-2xl font-bold text-white mb-4`}>
                Job Description
              </h2>
              <div className={`text-white leading-relaxed whitespace-pre-wrap`}>
                {job.description || 'No description available for this position.'}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className={`bg-gray-900 text-white rounded-lg shadow-md p-8 mb-6`}>
                <h2 className={`text-2xl font-bold text-white mb-4`}>
                  Requirements
                </h2>
                <div className={`text-white leading-relaxed whitespace-pre-wrap`}>
                  {job.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Job Information */}
            <div className={`bg-gray-900 text-white rounded-lg shadow-md p-6 mb-6`}>
              <h3 className={`text-lg font-semibold text-white mb-4`}>
                Job Information
              </h3>
              <div className="space-y-4">
                <div>
                  <dt className={`text-sm font-medium text-gray-500`}>
                    Posted Date
                  </dt>
                  <dd className={`mt-1 text-sm text-gray-700`}>
                    {formatDate(job.postedDate)}
                  </dd>
                </div>
                {job.deadline && (
                  <div>
                    <dt className={`text-sm font-medium text-gray-500`}>
                      Application Deadline
                    </dt>
                    <dd className={`mt-1 text-sm text-gray-700`}>
                      {formatDate(job.deadline)}
                    </dd>
                  </div>
                )}
                {job.experience && (
                  <div>
                    <dt className={`text-sm font-medium text-gray-500`}>
                      Experience Level
                    </dt>
                    <dd className={`mt-1 text-sm text-gray-700`}>
                      {job.experience}
                    </dd>
                  </div>
                )}
                {job.category && (
                  <div>
                    <dt className={`text-sm font-medium text-gray-500`}>
                      Category
                    </dt>
                    <dd className={`mt-1 text-sm text-gray-700`}>
                      {job.category}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className={`bg-gray-900 text-white rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold text-white mb-4`}>
                About {job.company}
              </h3>
              <div className="space-y-4">
                {job.companyDescription ? (
                  <p className={`text-white leading-relaxed`}>
                    {job.companyDescription}
                  </p>
                ) : (
                  <p className={`text-sm text-gray-500 italic`}>
                    No company information available.
                  </p>
                )}
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors`}
                  >
                    Visit Company Website
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
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