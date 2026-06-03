import React, { useState, useEffect } from 'react';
import { getEducations, addEducation, updateEducation, deleteEducation } from '@/services/profileService';
import { GraduationCap, Plus, Trash2, Edit3, Check, BookOpen, Calendar } from "lucide-react";

const Education = () => {
  const [educations, setEducations] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const data = await getEducations();
        setEducations(data || []);
      } catch (err) {
        console.error('Error fetching educations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAdd = async (data) => {
    setIsLoading(true);
    try {
      const res = await addEducation(data);
      if (res.success && res.education) {
        setEducations(prev => [res.education, ...prev]);
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Error adding education:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id, data) => {
    setIsLoading(true);
    try {
      const res = await updateEducation(id, data);
      if (res.success && res.education) {
        setEducations(prev => prev.map(e => e.id === id ? res.education : e));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error updating education:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    setIsLoading(true);
    try {
      const res = await deleteEducation(id);
      if (res.success) setEducations(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting education:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear + 5 - i);

  const EducationForm = ({ education = null, onSave, onCancel }: { education?: any; onSave: any; onCancel: any }) => {
    const [form, setForm] = useState({
      school: education?.school || '',
      degree: education?.degree || '',
      fieldOfStudy: education?.fieldOfStudy || '',
      startYear: education?.startYear || '',
      endYear: education?.endYear || '',
      grade: education?.grade || '',
      activities: education?.activities || '',
      description: education?.description || '',
      isCurrentlyStudying: education ? !education.endYear : false,
    });

    const isValid = form.school.trim() && form.degree.trim();

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!isValid) return;
      const { isCurrentlyStudying, ...rest } = form as any;
      onSave({ ...rest, endYear: isCurrentlyStudying ? null : rest.endYear });
    };

    const inputClasses = `w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 h-11 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400`;
    const selectClasses = `${inputClasses} cursor-pointer`;

    return (
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* School & Degree */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">School / University *</label>
              <input
                type="text"
                value={form.school}
                onChange={e => setForm(p => ({ ...p, school: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: IIT Bombay, Stanford University"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Degree *</label>
              <input
                type="text"
                value={form.degree}
                onChange={e => setForm(p => ({ ...p, degree: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: B.Tech, MBA, B.Sc"
                required
              />
            </div>
          </div>

          {/* Field of Study & Grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Field of Study</label>
              <input
                type="text"
                value={form.fieldOfStudy}
                onChange={e => setForm(p => ({ ...p, fieldOfStudy: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Computer Science, Finance"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Grade / GPA</label>
              <input
                type="text"
                value={form.grade}
                onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: 8.5 CGPA, 3.8/4.0"
              />
            </div>
          </div>

          {/* Years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Start Year</label>
              <select
                value={form.startYear}
                onChange={e => setForm(p => ({ ...p, startYear: e.target.value }))}
                className={selectClasses}
              >
                <option value="">Select year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">End Year</label>
              <div className="space-y-2">
                <select
                  value={form.endYear}
                  onChange={e => setForm(p => ({ ...p, endYear: e.target.value }))}
                  disabled={form.isCurrentlyStudying}
                  className={selectClasses}
                >
                  <option value="">Select year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <label className="flex items-center gap-2.5 cursor-pointer group/lbl">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.isCurrentlyStudying ? 'bg-slate-900 border-slate-900' : 'border-slate-200 group-hover/lbl:border-primary/50'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.isCurrentlyStudying}
                      onChange={e => setForm(p => ({ ...p, isCurrentlyStudying: e.target.checked, endYear: e.target.checked ? '' : p.endYear }))}
                    />
                    {form.isCurrentlyStudying && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className="text-[12px] font-medium text-gray-600">I am currently studying here</span>
                </label>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Activities & Societies</label>
            <input
              type="text"
              value={form.activities}
              onChange={e => setForm(p => ({ ...p, activities: e.target.value }))}
              className={inputClasses}
              placeholder="Ex: Coding Club, Student Council, Debate Team"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className={`${inputClasses} h-24 pt-3 resize-none`}
              placeholder="Relevant coursework, projects, achievements..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="flex-1 h-11 bg-slate-900 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              <span>{education ? 'Save Changes' : 'Add Education'}</span>
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
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
          <p className="text-gray-500 text-[13px]">Your academic background and qualifications</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="px-5 py-2 bg-primary text-white font-semibold text-[14px] rounded-full hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Add Education
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="mb-8">
          <EducationForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {educations.length === 0 && !isAdding ? (
          <div className="p-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <GraduationCap size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No education listed yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-[13px]">Add your academic history to strengthen your profile.</p>
          </div>
        ) : (
          educations.map(edu => (
            <div key={edu.id} className="relative">
              {editingId === edu.id ? (
                <EducationForm
                  education={edu}
                  onSave={(updated) => handleEdit(edu.id, updated)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex gap-4">
                      <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{edu.school}</h3>
                        <p className="text-[14px] font-medium text-gray-700 mt-0.5">
                          {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-gray-400 mt-1">
                          {(edu.startYear || edu.endYear) && (
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {edu.startYear || '?'} — {edu.endYear || 'Present'}
                            </span>
                          )}
                          {edu.grade && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <BookOpen size={11} /> Grade: {edu.grade}
                              </span>
                            </>
                          )}
                        </div>
                        {edu.activities && (
                          <p className="text-[12px] text-gray-500 mt-1">
                            <span className="font-semibold">Activities:</span> {edu.activities}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-[13px] text-gray-600 leading-relaxed mt-2 max-w-2xl">{edu.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(edu.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {educations.length > 0 && (
        <div className="mt-8 p-5 rounded-xl bg-blue-50/30 border border-blue-100/50 flex flex-col md:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-blue-100">
            <GraduationCap size={18} />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-gray-900 text-sm font-bold tracking-tight">Academic Background</h4>
            <p className="text-gray-500 text-[12px]">
              Profile updated with <span className="text-primary font-semibold">{educations.length} education {educations.length === 1 ? 'entry' : 'entries'}</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;
