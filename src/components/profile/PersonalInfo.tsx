import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from '@/services/profileService';

const PersonalInfo = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    // User model fields
    name: '',
    email: '',
    phone: '',
    // UserProfile model fields
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
    // Initialize form with user data
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

  // Fetch profile data when component mounts
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
            headline: profileData.headline || '',
            bio: profileData.bio || '',
            experienceYears: profileData.experienceYears || 0,
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
    // Reset form data
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || ''
      }));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Personal Information
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Update your personal details and professional information
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">✏️</span>
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 sm:space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500`}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500`}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500`}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500`}
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Professional Information</h3>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors resize-none"
                placeholder="Tell us about yourself, your passion, and what drives you professionally..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Years of Experience
                </label>
                <select
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Current Role
                </label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                  placeholder="Current position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                  placeholder="Desired position"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Target Industry
              </label>
              <input
                type="text"
                name="targetIndustry"
                value={formData.targetIndustry}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Resume URL
              </label>
              <input
                type="url"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                placeholder="https://example.com/resume.pdf"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;