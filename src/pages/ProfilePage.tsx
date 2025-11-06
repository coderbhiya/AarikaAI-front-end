import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PersonalInfo from "@/components/profile/PersonalInfo";
import Skills from "@/components/profile/Skills";
import Experience from "@/components/profile/Experience";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, toggleSidebar } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    {
      id: "personal",
      name: "Personal Info",
      icon: "👤",
      component: PersonalInfo,
    },
    {
      id: "skills",
      name: "Skills",
      icon: "🛠️",
      component: Skills,
    },
    {
      id: "experience",
      name: "Experience",
      icon: "💼",
      component: Experience,
    },
  ];
  const navigate = useNavigate();
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div
      className={`min-h-screen w-full sm:w-[90%] text-white overflow-y-auto mt-14 mx-auto`}
    >
      {/* Header */}
      {/* Mobile Header */}
      <div className="mobile-header md:hidden">
        <button
          className="mobile-back-button"
          onClick={() => navigate("/chat")}
        >
          <ArrowLeft size={24} />
        </button>

        <button className="mobile-more-button" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>
      <div className={`bg-white/5 border-gray-700 shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  {user?.displayName?.[0] || user?.email?.[0] || "U"}
                </div>
                <div>
                  <h1 className={`text-xl sm:text-2xl font-bold text-white`}>
                    {user?.displayName || "User Profile"}
                  </h1>
                  <p className={`text-sm sm:text-base text-gray-300`}>
                    {user?.email || user?.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <div
                  className={`flex items-center space-x-2 text-sm text-gray-300`}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Profile Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`bg-white/5 border-gray-700 border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 sm:px-6 sm:py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400 bg-white/5 bg-opacity-50"
                    : "border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-600"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div
          className={` border-gray-700 rounded-lg sm:rounded-xl shadow-sm border`}
        >
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
