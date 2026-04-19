import React, { useState, useEffect } from 'react';
import { getExperiences, addExperience, updateExperience, deleteExperience } from '@/services/profileService';
import { Briefcase, Calendar, Plus, Trash2, Edit3, X, Check, Building2, MapPin, ExternalLink, Trophy } from "lucide-react";

const Experience = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
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

    const inputClasses = `w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400 h-11`;

    return (
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Company *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Google, Microsoft"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Title *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Software Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={inputClasses}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">End Date</label>
              <div className="space-y-3">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={formData.isCurrentJob}
                  className={inputClasses}
                />
                <label className="flex items-center gap-2.5 cursor-pointer group/label">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.isCurrentJob ? 'bg-slate-900 border-slate-900' : 'border-slate-200 group-hover/label:border-primary/50'}`}>
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
                    {formData.isCurrentJob && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className="text-[12px] font-medium text-gray-600">I am currently working in this role</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`${inputClasses} resize-none h-24 pt-3`}
              placeholder="Describe your responsibilities and impact..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Key Achievements</label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
              rows={3}
              className={`${inputClasses} resize-none h-24 pt-3`}
              placeholder="List your quantifiable successes and projects..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className="flex-1 h-11 bg-slate-900 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              <span>{experience ? 'Save Changes' : 'Add Experience'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 h-11 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
          <p className="text-gray-500 text-[13px]">Your professional journey and key achievements</p>
        </div>
        <button
          onClick={() => setIsAddingExperience(true)}
          disabled={isAddingExperience}
          className="px-5 py-2 bg-primary text-white font-semibold text-[14px] rounded-full hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Add Experience
        </button>
      </div>

      {/* Add Section */}
      {isAddingExperience && (
        <div className="mb-8">
          <ExperienceForm onSave={handleAddExperience} onCancel={() => setIsAddingExperience(false)} />
        </div>
      )}

      {/* Experiences List */}
      <div className="space-y-4 relative">
        {experiences.length === 0 && !isAddingExperience ? (
          <div className="p-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Building2 size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No experience listed yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-[13px]">Add your professional history to showcase your career growth.</p>
          </div>
        ) : (
          experiences.map((experience: any) => (
            <div key={experience.id} className="relative">
              {editingExperience === experience.id ? (
                <ExperienceForm
                  experience={experience}
                  onSave={(updated) => handleEditExperience(experience.id, updated)}
                  onCancel={() => setEditingExperience(null)}
                />
              ) : (
                <div className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex gap-4">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{experience.role}</h3>
                        <p className="text-[14px] font-medium text-gray-700 mt-0.5">{experience.companyName}</p>
                        <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            {formatDate(experience.startDate)} — {formatDate(experience.endDate)}
                          </span>
                          <span>•</span>
                          <span>{calculateDuration(experience.startDate, experience.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingExperience(experience.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {experience.description && (
                    <div className="mt-3 text-[13px] text-gray-600 leading-relaxed max-w-3xl">
                      {experience.description}
                    </div>
                  )}

                  {experience.achievements && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-100">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Impact</h4>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{experience.achievements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Summary */}
      {experiences.length > 0 && (
        <div className="mt-8 p-5 rounded-xl bg-blue-50/30 border border-blue-100/50 flex flex-col md:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-blue-100">
            <Trophy size={18} />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-gray-900 text-sm font-bold tracking-tight">Professional History</h4>
            <p className="text-gray-500 text-[12px]">
              Profile updated with <span className="text-primary font-semibold">{experiences.length} roles</span>. Your history is up track.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experience;