import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/services/profileService';
import { Trophy, Plus, Trash2, Edit3, Check } from "lucide-react";

const Achievements = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getProfile();
        if (response.success && response.user?.UserProfile?.achievements) {
          setAchievements(response.user.UserProfile.achievements || []);
        }
      } catch (error) {
        console.error('Error fetching profile achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveAchievements = async (newAchievements) => {
    setIsLoading(true);
    try {
      const response = await updateProfile({ achievements: newAchievements });
      if (response.success) {
        setAchievements(newAchievements);
        setIsAdding(false);
        setEditingIndex(null);
      }
    } catch (error) {
      console.error('Error updating achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (achievement) => {
    saveAchievements([achievement, ...achievements]);
  };

  const handleEdit = (index, updatedAchievement) => {
    const updated = [...achievements];
    updated[index] = updatedAchievement;
    saveAchievements(updated);
  };

  const handleDelete = (index) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    const updated = achievements.filter((_, i) => i !== index);
    saveAchievements(updated);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const AchievementForm = ({ achievement = null, onSave, onCancel }: { achievement?: any; onSave: any; onCancel: any }) => {
    const [formData, setFormData] = useState({
      title: achievement?.title || '',
      issuer: achievement?.issuer || '',
      date: achievement?.date ? new Date(achievement.date).toISOString().split('T')[0] : '',
      description: achievement?.description || ''
    });

    const isFormValid = formData.title.trim();

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isFormValid) {
        onSave(formData);
      }
    };

    const inputClasses = `w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400 h-11`;

    return (
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Employee of the Year"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Issuer / Organization</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Aarika AI"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={`${inputClasses} md:w-1/2`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`${inputClasses} resize-none h-24 pt-3`}
              placeholder="Describe your achievement..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className="flex-1 h-11 bg-slate-900 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              <span>{achievement ? 'Save Changes' : 'Add Achievement'}</span>
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
          <h2 className="text-xl font-bold text-gray-900">Honors & Achievements</h2>
          <p className="text-gray-500 text-[13px]">Showcase your awards and significant accomplishments</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="px-5 py-2 bg-primary text-white font-semibold text-[14px] rounded-full hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Add Achievement
        </button>
      </div>

      {/* Add Section */}
      {isAdding && (
        <div className="mb-8">
          <AchievementForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
        </div>
      )}

      {/* Achievements List */}
      <div className="space-y-4 relative">
        {achievements.length === 0 && !isAdding ? (
          <div className="p-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Trophy size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No achievements listed</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-[13px]">Add your honors, awards, or significant achievements.</p>
          </div>
        ) : (
          achievements.map((achievement: any, index: number) => (
            <div key={index} className="relative">
              {editingIndex === index ? (
                <AchievementForm
                  achievement={achievement}
                  onSave={(updated) => handleEdit(index, updated)}
                  onCancel={() => setEditingIndex(null)}
                />
              ) : (
                <div className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex gap-4">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{achievement.title}</h3>
                        <p className="text-[14px] font-medium text-gray-700 mt-0.5">{achievement.issuer}</p>
                        {achievement.date && (
                          <div className="text-[12px] text-gray-500 mt-1">
                            Issued {formatDate(achievement.date)}
                          </div>
                        )}
                        {achievement.description && (
                          <div className="mt-3 text-[13px] text-gray-600 leading-relaxed max-w-3xl">
                            {achievement.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
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
    </div>
  );
};

export default Achievements;
