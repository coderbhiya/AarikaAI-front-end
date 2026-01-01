import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from '@/services/profileService';
import { Edit3, Save, X, User, Mail, Phone, MapPin, Globe, CreditCard } from "lucide-react";

const PersonalInfo = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    headline: '',
    bio: '',
    experienceYears: '',
    currentRole: '',
    targetRole: '',
    targetIndustry: '',
    location: '',
    resumeUrl: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await getProfile();
        if (response.success && response.user) {
          const userData = response.user;
          const profileData = userData.UserProfile || {};

          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            headline: profileData.headline || '',
            bio: profileData.bio || '',
            experienceYears: profileData.experienceYears || '',
            currentRole: profileData.currentRole || '',
            targetRole: profileData.targetRole || '',
            targetIndustry: profileData.targetIndustry || '',
            location: profileData.location || '',
            resumeUrl: profileData.resumeUrl || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);
      if (response.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const inputClasses = `w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className="p-8 sm:p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
          <p className="text-gray-400 font-medium">Manage your personal and professional profile details.</p>
        </div>

        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-12">
        {/* Section: Basic */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-8 border-l-2 border-primary pl-4">Identity & Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} className="text-primary" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClasses}
                placeholder="Ex. John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-primary" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClasses}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={12} className="text-primary" /> Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClasses}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-primary" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClasses}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
        </div>

        {/* Section: Professional */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-8 border-l-2 border-primary pl-4">Professional Compass</h3>
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClasses}
                placeholder="Senior Architect | ex-Google | AI Enthusiast"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Biography
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className={`${inputClasses} resize-none h-32`}
                placeholder="Craft your story..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience (Years)</label>
                <select
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="">Select Level</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Role</label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClasses}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClasses}
                  placeholder="Product Lead"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Target Industry
                </label>
                <input
                  type="text"
                  name="targetIndustry"
                  value={formData.targetIndustry}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClasses}
                  placeholder="Fintech, Healthtech..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Resume / Portfolio Link
                </label>
                <input
                  type="url"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClasses}
                  placeholder="https://portfolio.com/resume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default PersonalInfo;