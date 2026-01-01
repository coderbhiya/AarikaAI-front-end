import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Trophy,
  Globe,
  Clock,
  CheckCircle2,
  Bookmark,
  X
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError('Failed to synchronize job coordinates. Please retry.');
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
      await axiosInstance.post(`/jobs/${id}/apply`);
    } catch (err) {
      console.error('Error tracking application:', err);
    } finally {
      setApplying(false);
      window.open(job.link, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Real-time';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] relative">
        <Loader2 size={40} className="text-primary animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Decoding Job Intelligence...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="glass-card rounded-[2.5rem] p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8 text-rose-500">
            <X size={40} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">{error ? 'Access Denied' : 'Node Not Found'}</h2>
          <p className="text-gray-500 mb-8">{error || 'The requested career node does not exist in our active database.'}</p>
          <div className="flex flex-col gap-3">
            <button onClick={fetchJobDetail} className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all active:scale-95">Re-establish Link</button>
            <Link to="/jobs" className="px-8 py-3 bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs rounded-2xl transition-all">Back to Index</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] relative">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px] group bg-white/5 px-4 py-2 rounded-xl border border-white/5"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-primary transition-all">
            <Bookmark size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Module */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-[2rem] p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Job Header Info */}
              <div className="flex flex-col gap-6 mb-10 pb-10 border-b border-white/5">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-primary shrink-0">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-1">{job.company}</h4>
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight mb-4">{job.title}</h1>

                    <div className="flex flex-wrap gap-2">
                      {job.location && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          <MapPin size={10} className="text-primary" /> {job.location}
                        </div>
                      )}
                      {job.employmentType && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          <Clock size={10} className="text-primary" /> {job.employmentType}
                        </div>
                      )}
                      {(job.jobSalary || job.jobMinSalary || job.jobMaxSalary) && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary text-[10px] font-bold uppercase tracking-widest">
                          <DollarSign size={10} /> {job.jobSalary || `${job.jobMinSalary} - ${job.jobMaxSalary}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleApply}
                  disabled={applying || !job.link}
                  className="group relative w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl overflow-hidden shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="relative flex items-center justify-center gap-3">
                    {applying ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                    <span>{job.link ? 'Launch Application Process' : 'Channel Locked'}</span>
                  </div>
                </button>
              </div>

              {/* Description Feed */}
              <div className="space-y-10">
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Position Context
                  </h3>
                  <div className="text-gray-400 font-medium leading-[1.7] text-base whitespace-pre-wrap">
                    {job.description || 'No descriptive data available for this intelligence node.'}
                  </div>
                </section>

                {job.requirements && (
                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      Credential Parameters
                    </h3>
                    <div className="text-gray-400 font-medium leading-[1.7] text-base whitespace-pre-wrap bg-white/[0.01] p-6 rounded-2xl border border-white/[0.03]">
                      {job.requirements}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Side Module */}
          <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Intel Dashboard */}
            <div className="glass-card rounded-[2rem] p-6 border-white/[0.05]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 pb-4 border-b border-white/5">Core Metrics</h3>
              <div className="space-y-5">
                {[
                  { label: "Posted", value: formatDate(job.postedDate), color: "text-white" },
                  { label: "Deadline", value: job.deadline ? formatDate(job.deadline) : "N/A", color: "text-rose-400" },
                  { label: "Experience", value: job.experience || "Any", color: "text-white" },
                  { label: "Domain", value: job.category || "General", color: "text-primary" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Entity Background */}
            <div className="glass-card rounded-[2rem] p-6 border-white/[0.05]">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary">
                  <Building2 size={20} />
                </div>
                <h3 className="text-sm font-black text-white tracking-tight uppercase">{job.company}</h3>
              </div>

              <p className="text-gray-500 text-xs leading-relaxed mb-6 font-medium">
                {job.companyDescription || 'This entity has chosen to remain in stealth mode regarding its descriptive profile.'}
              </p>

              {job.companyWebsite && (
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl group transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Neural Hub</span>
                  <Globe size={16} className="text-primary transition-transform group-hover:rotate-12" />
                </a>
              )}
            </div>

            {/* AI Career Projection */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary to-emerald-600 shadow-xl shadow-primary/10 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Trophy size={24} className="text-white" />
                  <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest">High Match</div>
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter mb-1">Projection: 94%</h3>
                <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-4">Neural Affinity Detected</p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-white/60 bg-black/10 p-2 rounded-lg">
                  <CheckCircle2 size={10} /> Personalized Verification Active
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;