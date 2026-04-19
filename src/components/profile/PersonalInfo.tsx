"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from '@/services/profileService';
import { Edit3, Save, X, User, Mail, Phone, MapPin, Globe, CreditCard } from "lucide-react";

const PersonalInfo = () => {
  const { user, updateUser } = useAuth();
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
    if (user && !isEditing) {
      const profile = user.UserProfile || user.userProfile || {};
      setFormData(prev => ({
        ...prev,
        name: user.name || user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        experienceYears: profile.experienceYears || '',
        currentRole: profile.currentRole || '',
        targetRole: profile.targetRole || '',
        targetIndustry: profile.targetIndustry || '',
        location: profile.location || '',
        resumeUrl: profile.resumeUrl || ''
      }));
    }
  }, [user, isEditing]);

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
        if (response.user) {
          updateUser(response.user);
        }
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

  const inputClasses = `w-full bg-slate-50/50 border border-slate-200/60 text-slate-900 rounded-lg px-4 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-medium h-11`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
          <p className="text-gray-500 text-[12px]">Manage your basic profile details and summary</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Edit3 size={18} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 h-9 flex items-center rounded-full border border-gray-300 text-gray-600 font-bold text-[12px] hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 h-9 flex items-center rounded-full bg-primary text-white font-bold text-[12px] hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Section: Basic */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4 px-1">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1 flex items-center gap-2">
                <User size={13} /> Full Name
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
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Mail size={13} /> Email
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
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Phone size={13} /> Phone
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
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1 flex items-center gap-2">
                <MapPin size={13} /> Location
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
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4 px-1">Professional Focus</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Professional Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClasses}
                placeholder="Strategizing the next move | AI Career Specialist"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">About / Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className={`${inputClasses} resize-none h-28 pt-3`}
                placeholder="Briefly describe your professional background and goals..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 ml-1">Experience Level</label>
                <div className="relative">
                  <select
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                  >
                    <option value="">Select Level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Globe size={14} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 ml-1">Current Role</label>
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
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 ml-1">Target Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClasses}
                  placeholder="Senior Lead Engineer"
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