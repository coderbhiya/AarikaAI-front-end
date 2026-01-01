import React, { useState, useEffect } from 'react';
import { getExperiences, addExperience, updateExperience, deleteExperience } from '@/services/profileService';
import { Briefcase, Calendar, Plus, Trash2, Edit3, X, Check, Building2, MapPin, ExternalLink, Trophy } from "lucide-react";

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const experiencesData = await getExperiences();
        setExperiences(experiencesData || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleAddExperience = async (experienceData) => {
    setIsLoading(true);
    try {
      const response = await addExperience(experienceData);

      if (response.success && response.experience) {
        setExperiences(prev => [response.experience, ...prev]);
        setIsAddingExperience(false);
      }
    } catch (error) {
      console.error('Error adding experience:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExperience = async (experienceId, updatedExperience) => {
    setIsLoading(true);
    try {
      const response = await updateExperience(experienceId, updatedExperience);

      if (response.success && response.experience) {
        setExperiences(prev => prev.map(exp =>
          exp.id === experienceId ? response.experience : exp
        ));
        setEditingExperience(null);
      }
    } catch (error) {
      console.error('Error updating experience:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    setIsLoading(true);
    try {
      const response = await deleteExperience(experienceId);

      if (response.success) {
        setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

    if (diffMonths < 12) {
      return `${diffMonths} mo${diffMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      return `${years} yr${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} mo${months !== 1 ? 's' : ''}` : ''}`;
    }
  };

  const ExperienceForm = ({ experience = null, onSave, onCancel }: { experience?: any; onSave: any; onCancel: any }) => {
    const [formData, setFormData] = useState({
      companyName: experience?.companyName || '',
      role: experience?.role || '',
      startDate: experience?.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
      endDate: experience?.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
      description: experience?.description || '',
      achievements: experience?.achievements || '',
      isCurrentJob: experience ? !experience.endDate : true
    });

    const isFormValid = formData.companyName.trim() && formData.role.trim() && formData.startDate;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isFormValid) {
        const dataToSave = {
          ...formData,
          endDate: formData.isCurrentJob ? null : formData.endDate
        };
        const { isCurrentJob, ...finalData } = dataToSave as any;
        onSave(finalData);
      }
    };

    const inputClasses = `w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50`;

    return (
      <div className="p-8 rounded-[2rem] bg-zinc-900 border border-primary/30 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Organization *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Google, SpaceX"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Position *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Senior Product Manager"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={inputClasses}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">End Date</label>
              <div className="space-y-4">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={formData.isCurrentJob}
                  className={inputClasses}
                />
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.isCurrentJob ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-primary/50'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.isCurrentJob}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        isCurrentJob: e.target.checked,
                        endDate: e.target.checked ? '' : prev.endDate
                      }))}
                    />
                    {formData.isCurrentJob && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-widest">Ongoing Role</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Role Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`${inputClasses} resize-none h-32`}
              placeholder="Key responsibilities and professional focus..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Notable Achievements</label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
              rows={3}
              className={`${inputClasses} resize-none h-32`}
              placeholder="Quantifiable impacts, projects, and awards..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className="flex-1 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
              {experience ? 'Commit Changes' : 'Initialize Experience'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 font-bold rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-8 sm:p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Professional Journey</h2>
          <p className="text-gray-400 font-medium">Log your career milestones and impact.</p>
        </div>
        <button
          onClick={() => setIsAddingExperience(true)}
          disabled={isAddingExperience}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <Plus size={18} /> Add Journey Point
        </button>
      </div>

      {/* Add Side */}
      {isAddingExperience && (
        <div className="mb-12">
          <ExperienceForm onSave={handleAddExperience} onCancel={() => setIsAddingExperience(false)} />
        </div>
      )}

      {/* Experiences List */}
      <div className="space-y-8 relative">
        {/* Timeline Line */}
        {experiences.length > 1 && (
          <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary/30 via-white/5 to-transparent hidden md:block" />
        )}

        {experiences.length === 0 && !isAddingExperience ? (
          <div className="p-20 text-center glass-card rounded-[2rem]">
            <Building2 size={48} className="mx-auto text-gray-700 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No journey points recorded</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Start documenting your professional evolution by adding your work history.</p>
          </div>
        ) : (
          experiences.map((experience: any, index) => (
            <div key={experience.id} className="relative md:pl-16 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Timeline Node */}
              <div className="absolute left-4 top-8 w-4 h-4 rounded-full border-2 border-primary bg-[#0a0a0a] z-10 hidden md:block" />

              {editingExperience === experience.id ? (
                <ExperienceForm
                  experience={experience}
                  onSave={(updated) => handleEditExperience(experience.id, updated)}
                  onCancel={() => setEditingExperience(null)}
                />
              ) : (
                <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8 hover:border-primary/30 transition-all hover:bg-white/[0.04]">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-primary shrink-0">
                        <Building2 size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white tracking-tight">{experience.role}</h3>
                          {!experience.endDate && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                          <span className="text-primary">{experience.companyName}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {formatDate(experience.startDate)} — {formatDate(experience.endDate)}
                          </div>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{calculateDuration(experience.startDate, experience.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => setEditingExperience(experience.id)}
                        className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {experience.description && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                          <Briefcase size={12} /> The Mission
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{experience.description}</p>
                      </div>
                    )}

                    {experience.achievements && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                          <Trophy size={12} /> Key Impacts
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{experience.achievements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Career Metrics Summary */}
      {experiences.length > 0 && (
        <div className="mt-16 p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Trophy size={32} />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Career Velocity</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              You have aggregated <span className="text-primary font-bold">{experiences.length} distinct professional epochs</span>. Each milestone strengthens your AI-powered career projection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experience;