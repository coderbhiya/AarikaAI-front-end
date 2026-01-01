import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PersonalInfo from "@/components/profile/PersonalInfo";
import Skills from "@/components/profile/Skills";
import Experience from "@/components/profile/Experience";
import { ArrowLeft, Menu, User, Briefcase, Award, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, toggleSidebar } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    {
      id: "personal",
      name: "Personal",
      icon: <User size={18} />,
      component: PersonalInfo,
    },
    {
      id: "skills",
      name: "Skills",
      icon: <Award size={18} />,
      component: Skills,
    },
    {
      id: "experience",
      name: "Experience",
      icon: <Briefcase size={18} />,
      component: Experience,
    },
  ];
  const navigate = useNavigate();
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/chat")}
              className="p-2.5 rounded-xl glass-button text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-primary font-bold tracking-widest uppercase text-xs">Profile Settings</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-tr from-primary to-emerald-400 p-1 shadow-2xl shadow-primary/20">
                  <div className="w-full h-full rounded-[1.8rem] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black perplexity-gradient-text">
                        {user?.displayName?.[0] || user?.email?.[0] || "U"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg border border-white/10">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                  {user?.displayName || "User Profile"}
                </h1>
                <p className="text-gray-400 font-medium">{user?.email || user?.phoneNumber}</p>
                <div className="flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Curriculum Vitae Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-fit mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
