"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import PersonalInfo from "@/components/profile/PersonalInfo";
import Skills from "@/components/profile/Skills";
import Experience from "@/components/profile/Experience";
import { Briefcase, Award, CheckCircle2, Download, ExternalLink, MapPin, Globe, Camera, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const ProfilePage = () => {
  const { user, toggleSidebar } = useAuth();
  const navigate = useRouter();
  const isMobile = useIsMobile();

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
                        {(user?.UserProfile?.headline || user?.userProfile?.headline) || "Strategizing the next move | AI Career Specialist"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 text-[14px] text-gray-500">
                        <span>{(user?.UserProfile?.location || user?.userProfile?.location) || "San Francisco, California, United States"}</span>
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

              {/* Content Sections */}
              <div className="space-y-4">
                {/* Personal Info Card */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <PersonalInfo />
                </div>

                {/* Experience Card */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <Experience />
                </div>

                {/* Skills Card */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <Skills />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
