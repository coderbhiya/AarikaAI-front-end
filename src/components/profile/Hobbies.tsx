import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/services/profileService';
import { Heart, Plus, X, Edit3, Trash2 } from "lucide-react";

const Hobbies = () => {
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHobby, setNewHobby] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getProfile();
        if (response.success && response.user?.UserProfile?.hobbies) {
          setHobbies(response.user.UserProfile.hobbies || []);
        }
      } catch (error) {
        console.error('Error fetching profile hobbies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveHobbies = async (newHobbiesList: string[]) => {
    setIsLoading(true);
    try {
      const response = await updateProfile({ hobbies: newHobbiesList });
      if (response.success) {
        setHobbies(newHobbiesList);
        setIsAdding(false);
        setNewHobby('');
        setEditingIndex(null);
      }
    } catch (error) {
      console.error('Error updating hobbies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHobby.trim()) {
      saveHobbies([...hobbies, newHobby.trim()]);
    }
  };

  const handleEdit = (index: number) => {
    const updated = [...hobbies];
    updated[index] = editValue.trim();
    if (updated[index]) {
      saveHobbies(updated);
    } else {
      handleDelete(index);
    }
  };

  const handleDelete = (index: number) => {
    const updated = hobbies.filter((_, i) => i !== index);
    saveHobbies(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleEdit(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hobbies & Interests</h2>
          <p className="text-gray-500 text-[13px]">Activities you enjoy outside of work</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="px-5 py-2 bg-primary text-white font-semibold text-[14px] rounded-full hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Add Hobby
        </button>
      </div>

      {/* Add Section */}
      {isAdding && (
        <form onSubmit={handleAdd} className="mb-8 flex gap-3">
          <input
            type="text"
            value={newHobby}
            onChange={(e) => setNewHobby(e.target.value)}
            placeholder="Ex: Photography, Hiking, Reading..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400 h-11"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newHobby.trim() || isLoading}
            className="px-6 h-11 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-primary transition-all disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => { setIsAdding(false); setNewHobby(''); }}
            className="px-4 h-11 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </form>
      )}

      {/* Hobbies List */}
      <div className="space-y-4">
        {hobbies.length === 0 && !isAdding ? (
          <div className="p-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Heart size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No hobbies listed</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-[13px]">Add hobbies to show your personality and interests.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {hobbies.map((hobby, index) => (
              <div key={index} className="group relative">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onBlur={() => handleEdit(index)}
                      className="bg-white border-2 border-primary/50 text-slate-900 rounded-full px-4 py-1.5 focus:outline-none text-sm font-medium w-48 shadow-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{hobby}</span>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingIndex(index); setEditValue(hobby); }}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hobbies;
