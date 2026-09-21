"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from '@/services/profileService';
import { Edit3, Save, X, User, Mail, Phone, MapPin, Globe, CreditCard, GraduationCap } from "lucide-react";

// Same board/exam value sets as onboarding (OnboardingFlow.tsx) — kept in
// sync manually since values are persisted verbatim into studentDetails.
const BOARD_OPTIONS = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE / CISCE" },
  { value: "STATE_MP", label: "MP Board (MPBSE)" },
  { value: "STATE_UP", label: "UP Board (UPMSP)" },
  { value: "STATE_MH", label: "Maharashtra (SSC / HSC)" },
  { value: "STATE_RJ", label: "Rajasthan Board (RBSE)" },
  { value: "STATE_BR", label: "Bihar Board (BSEB)" },
  { value: "STATE_WB", label: "West Bengal (WBBSE)" },
  { value: "STATE_KA", label: "Karnataka (KSEEB / PUC)" },
  { value: "STATE_TN", label: "Tamil Nadu (TNBSE)" },
  { value: "STATE_AP", label: "Andhra Pradesh (BSEAP)" },
  { value: "STATE_TS", label: "Telangana (BSETS)" },
  { value: "STATE_GJ", label: "Gujarat Board (GSEB)" },
  { value: "STATE_HR", label: "Haryana Board (HBSE)" },
  { value: "STATE_PB", label: "Punjab Board (PSEB)" },
  { value: "STATE_OD", label: "Odisha Board (BSE)" },
  { value: "STATE_JH", label: "Jharkhand Board (JAC)" },
  { value: "STATE_CG", label: "Chhattisgarh (CGBSE)" },
  { value: "STATE_UK", label: "Uttarakhand (UBSE)" },
  { value: "STATE_HP", label: "Himachal Pradesh (HPBOSE)" },
  { value: "STATE_AS", label: "Assam Board (SEBA)" },
  { value: "STATE_KL", label: "Kerala Board (HSE)" },
  { value: "STATE_OTHER", label: "Other State Board" },
];
const STREAM_OPTIONS = [
  { value: "SCIENCE", label: "Science" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "ARTS", label: "Arts" },
];
const EXAM_OPTIONS = [
  { value: "JEE_MAIN", label: "JEE Main" },
  { value: "JEE_ADV", label: "JEE Advanced" },
  { value: "NEET", label: "NEET UG" },
  { value: "CUET", label: "CUET UG" },
  { value: "NDA", label: "NDA" },
  { value: "BOARD_10", label: "Class 10 Boards" },
  { value: "BOARD_12", label: "Class 12 Boards" },
  { value: "OLYMPIAD", label: "Olympiads" },
];

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
  const [academicData, setAcademicData] = useState({
    class: '',
    board: '',
    stream: '',
    wantsExamPrep: false,
    targetExams: [] as string[],
  });

  const isSchoolStudent = user?.UserProfile?.personaType === "STUDENT"
    && user?.UserProfile?.studentDetails?.educationLevel === "school";

  const mapExperienceToOption = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num < 1) return "0-1";
    if (num < 3) return "1-3";
    if (num < 5) return "3-5";
    if (num < 10) return "5-10";
    return "10+";
  };

  useEffect(() => {
    if (user && !isEditing) {
      const profile = user.UserProfile || {};
      setFormData(prev => ({
        ...prev,
        name: user.name || user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        experienceYears: mapExperienceToOption(profile.experienceYears),
        currentRole: profile.currentRole || '',
        targetRole: profile.targetRole || '',
        targetIndustry: profile.targetIndustry || '',
        location: profile.location || '',
        resumeUrl: profile.resumeUrl || ''
      }));
      const sd = profile.studentDetails || {};
      setAcademicData({
        class: sd.class || '',
        board: sd.board || '',
        stream: sd.stream || '',
        wantsExamPrep: !!sd.wantsExamPrep,
        targetExams: Array.isArray(sd.targetExams) ? sd.targetExams : [],
      });
    }
  }, [user, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAcademicChange = (e) => {
    const { name, value } = e.target;
    setAcademicData(prev => ({
      ...prev,
      [name]: value,
      // Stream only applies to Class 11/12 — drop it if the student moves
      // to a lower class so a stale value doesn't linger unseen.
      ...(name === 'class' && value !== '11' && value !== '12' ? { stream: '' } : {}),
    }));
  };

  const toggleTargetExam = (value: string) => {
    setAcademicData(prev => ({
      ...prev,
      targetExams: prev.targetExams.includes(value)
        ? prev.targetExams.filter(e => e !== value)
        : [...prev.targetExams, value],
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
            experienceYears: mapExperienceToOption(profileData.experienceYears),
            currentRole: profileData.currentRole || '',
            targetRole: profileData.targetRole || '',
            targetIndustry: profileData.targetIndustry || '',
            location: profileData.location || '',
            resumeUrl: profileData.resumeUrl || ''
          });
          const sd = profileData.studentDetails || {};
          setAcademicData({
            class: sd.class || '',
            board: sd.board || '',
            stream: sd.stream || '',
            wantsExamPrep: !!sd.wantsExamPrep,
            targetExams: Array.isArray(sd.targetExams) ? sd.targetExams : [],
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
      const payload = isSchoolStudent
        ? { ...formData, studentDetails: academicData }
        : formData;
      const response = await updateProfile(payload);
      if (response.success) {
        // Refetch profile to sync context and prevent old data from reverting the UI
        const profileRes = await getProfile();
        if (profileRes.success && profileRes.user) {
          updateUser(profileRes.user);
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

        {/* Section: Professional / Academic — the fields here depend on the
            persona picked at onboarding (OnboardingFlow.tsx). A school
            student (Class 7-12) has no "Current Role" or work experience, so
            showing those fields to them doesn't make sense; they get their
            class/board/stream/exam-prep fields instead. */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4 px-1">
            {isSchoolStudent ? "Academic Details" : "Professional Focus"}
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">
                {isSchoolStudent ? "Headline" : "Professional Headline"}
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClasses}
                placeholder={isSchoolStudent ? "Preparing for Class 10 Boards" : "Strategizing the next move | AI Career Specialist"}
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
                placeholder={isSchoolStudent ? "Briefly describe your interests and academic goals..." : "Briefly describe your professional background and goals..."}
              />
            </div>

            {isSchoolStudent ? (
              <>
                <div className={`grid grid-cols-1 gap-4 ${(academicData.class === '11' || academicData.class === '12') ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-gray-700 ml-1">Class</label>
                    <div className="relative">
                      <select
                        name="class"
                        value={academicData.class}
                        onChange={handleAcademicChange}
                        disabled={!isEditing}
                        className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                      >
                        <option value="">Select Class</option>
                        {["7", "8", "9", "10", "11", "12"].map(c => (
                          <option key={c} value={c}>Class {c}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <GraduationCap size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-gray-700 ml-1">Board</label>
                    <div className="relative">
                      <select
                        name="board"
                        value={academicData.board}
                        onChange={handleAcademicChange}
                        disabled={!isEditing}
                        className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                      >
                        <option value="">Select Board</option>
                        {BOARD_OPTIONS.map(b => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Globe size={14} />
                      </div>
                    </div>
                  </div>
                  {(academicData.class === '11' || academicData.class === '12') && (
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-gray-700 ml-1">Stream</label>
                      <div className="relative">
                        <select
                          name="stream"
                          value={academicData.stream}
                          onChange={handleAcademicChange}
                          disabled={!isEditing}
                          className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                        >
                          <option value="">Select Stream</option>
                          {STREAM_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={academicData.wantsExamPrep}
                      disabled={!isEditing}
                      onChange={(e) => setAcademicData(prev => ({ ...prev, wantsExamPrep: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-primary disabled:opacity-50"
                    />
                    Preparing for a competitive/board exam
                  </label>
                  {academicData.wantsExamPrep && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {EXAM_OPTIONS.map(ex => {
                        const isSelected = academicData.targetExams.includes(ex.value);
                        return (
                          <button
                            key={ex.value}
                            type="button"
                            disabled={!isEditing}
                            onClick={() => toggleTargetExam(ex.value)}
                            className={`px-3 h-8 rounded-full border text-[12px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              isSelected
                                ? "border-primary/40 bg-primary/5 text-primary"
                                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {ex.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;