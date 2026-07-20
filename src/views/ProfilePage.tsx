"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import PersonalInfo from "@/components/profile/PersonalInfo";
import Skills from "@/components/profile/Skills";
import Experience from "@/components/profile/Experience";
import Education from "@/components/profile/Education";
import Projects from "@/components/profile/Projects";
import Courses from "@/components/profile/Courses";
import Certifications from "@/components/profile/Certifications";
import Achievements from "@/components/profile/Achievements";
import Hobbies from "@/components/profile/Hobbies";
import { Briefcase, Award, CheckCircle2, Download, ExternalLink, MapPin, Globe, Camera, Menu, User, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { ProfileSyncModal } from "@/components/profile/ProfileSyncModal";
import CareerJourneyTab from "@/components/profile/CareerJourneyTab";
import LeaderboardTab from "@/components/LeaderboardTab";

const ProfilePage = () => {
  const { user, toggleSidebar, syncProfile } = useAuth();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'journey' | 'leaderboard'>('profile');

  useEffect(() => {
    // Sync profile on mount to ensure we have the latest pendingResumeSnapshot
    // if the user just navigated here from uploading a resume on another page.
    syncProfile().catch(console.error);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F0F2F5] relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100/50 w-full">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Menu size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">Profile Area</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-none">
        <div className="max-w-[1128px] mx-auto pt-6 px-4">
          {/* Banner alert if pendingResumeSnapshot exists */}
          {user?.UserProfile?.pendingResumeSnapshot && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-slate-900/90 dark:to-indigo-950/20 backdrop-blur-md border border-blue-200/50 dark:border-blue-900/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Unsaved Resume Details Detected
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    We parsed a resume but haven't applied all changes to your profile.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                Review Changes <ArrowRight size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Main Column */}
            <div className="lg:col-span-12 space-y-4">

              {/* Intro Card */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 relative">
                  <button className="absolute top-4 right-4 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors border border-white/20">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="px-6 pb-6 pt-0 relative">
                  <div className="relative inline-block -mt-[92px] mb-3">
                    <div className="w-[160px] h-[160px] rounded-full bg-white p-1 border-[4px] border-white shadow-sm overflow-hidden">
                      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl font-bold text-slate-300">
                            {user?.displayName?.[0] || user?.email?.[0] || "U"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h1 className="text-[24px] font-semibold text-[#1d2226]">
                          {user?.name || user?.displayName || "Aarika.AI User"}
                        </h1>
                        <CheckCircle2 size={18} className="text-blue-600" />
                      </div>
                      <p className="text-[#1d2226] text-[16px] leading-tight mb-2 font-medium">
                        {(user?.UserProfile?.headline) || "Strategizing the next move | AI Career Specialist"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 text-[14px] text-gray-500">
                        <span>{(user?.UserProfile?.location) || "San Francisco, California, United States"}</span>
                        <span className="text-gray-300">•</span>
                        <button className="text-blue-600 font-semibold hover:underline">Contact info</button>
                      </div>
                      <div className="mt-1 text-blue-600 font-semibold text-[14px] hover:underline cursor-pointer">
                        500+ career connections
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button className="h-9 px-4 rounded-full bg-blue-600 text-white font-bold text-[14px] hover:bg-blue-700 transition-colors shadow-sm">
                        Open to
                      </button>
                      <button className="h-9 px-4 rounded-full border border-blue-600 text-blue-600 font-bold text-[14px] hover:bg-blue-50 transition-colors">
                        Add profile section
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 text-gray-500 hover:bg-gray-50 transition-colors">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Tabs */}
              <div className="bg-white border border-gray-200 rounded-xl px-4 flex items-center gap-6 shadow-sm overflow-x-auto scrollbar-none">
                <button
                  className={`py-4 text-[15px] font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile Details
                </button>
                <button
                  className={`py-4 text-[15px] font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'journey' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('journey')}
                >
                  Career Journey
                </button>
                <button
                  className={`py-4 text-[15px] font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'leaderboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('leaderboard')}
                >
                  Leaderboard
                </button>
              </div>

              {/* Content Sections */}
              {activeTab === 'profile' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Personal Info Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <PersonalInfo />
                  </div>

                  {/* Experience Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Experience />
                  </div>

                  {/* Education Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Education />
                  </div>

                  {/* Projects Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Projects />
                  </div>

                  {/* Skills Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Skills />
                  </div>

                  {/* Courses Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Courses />
                  </div>

                  {/* Certifications Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Certifications />
                  </div>

                  {/* Achievements Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Achievements />
                  </div>

                  {/* Hobbies Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <Hobbies />
                  </div>
                </div>
              ) : activeTab === 'journey' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <CareerJourneyTab />
                </div>
              ) : activeTab === 'leaderboard' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <LeaderboardTab />
                </div>
              ) : null}

            </div>
          </div>
        </div>
      </div>

      <ProfileSyncModal
        isOpen={isSyncModalOpen}
        onClose={async (updated) => {
          setIsSyncModalOpen(false);
          if (updated) {
            await syncProfile();
            window.location.reload();
          }
        }}
        pendingResumeSnapshot={user?.UserProfile?.pendingResumeSnapshot as any}
      />
    </div>
  );
};

export default ProfilePage;
