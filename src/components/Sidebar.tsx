"use client";

import React from "react";
import {
  MessageSquare,
  User,
  Briefcase,
  LogOut,
  X,
  Bell,
  Star,
  Settings,
  PlusCircle,
  Clock,
  Sparkles,
  Zap,
  Globe,
  Compass,
  ArrowUpRight,
  Megaphone,
  Users
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BrainLogo from "./BrainLogo";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to?: string;
  onClick?: () => void;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  to,
  onClick,
  badge,
}) => {
  const navigate = useRouter();
  const { toggleSidebar, showSidebar } = useAuth();
  const isMobile = useIsMobile();

  const handleClick = () => {
    if (to) {
      navigate.push(to);
      if (isMobile) toggleSidebar();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`group flex items-center ${(!isMobile && !showSidebar) ? "justify-center px-0" : "justify-between px-3.5"} w-full py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${active
        ? "bg-primary/10 text-primary"
        : "text-[#444746] hover:bg-gray-100"
        }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className={`transition-colors ${active ? "text-primary" : "text-gray-400 group-hover:text-[#202124]"}`}>
          {icon}
        </div>
        {((!isMobile && showSidebar) || isMobile) && (
          <span className={`text-[14px] font-medium transition-colors whitespace-nowrap ${active ? "text-primary font-semibold" : "group-hover:text-[#202124]"}`}>
            {label}
          </span>
        )}
      </div>

      {((!isMobile && showSidebar) || isMobile) && badge && (
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};

const Sidebar = () => {
  const isMobile = useIsMobile();
  const { logout, showSidebar, toggleSidebar, user } = useAuth();
  const navigate = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      navigate.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sidebarClasses = isMobile
    ? `fixed inset-0 z-50 ${showSidebar ? "translate-x-0" : "-translate-x-full"
    } transition-transform duration-300`
    : `h-screen bg-white border-r border-gray-100 flex flex-col relative z-30 transition-all duration-300 ease-in-out ${showSidebar ? "w-64" : "w-[72px]"
    }`;

  return (
    <div className={sidebarClasses}>
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`${isMobile
          ? "fixed left-0 top-0 h-full w-72 bg-white z-50 border-r border-gray-100 flex flex-col"
          : "flex flex-col h-full"
          }`}
      >
        {/* Header */}
        <div className={`p-6 flex items-center ${showSidebar ? "justify-between" : "justify-center px-0"} relative`}>
          {(!isMobile && !showSidebar) ? (
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden cursor-pointer" onClick={() => navigate.push("/chat")}>
              <BrainLogo size={24} />
            </div>
          ) : (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate.push("/chat")}>
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                <BrainLogo size={32} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#202124] tracking-tight leading-none mb-1">Aarika.AI</h1>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Strategic Intel</p>
              </div>
            </div>
          )}
          {isMobile ? (
            <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          ) : (
            <button 
              onClick={toggleSidebar} 
              className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 z-50 transition-transform hover:scale-110"
            >
              {showSidebar ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className={`px-4 mb-8 ${(!isMobile && !showSidebar) ? "px-2" : ""}`}>
          <button
            className={`w-full flex items-center ${(!isMobile && !showSidebar) ? "justify-center p-3" : "gap-3 px-5 py-3"} rounded-2xl bg-[#F0F4F9] hover:bg-[#D3E3FD] text-[#041E49] transition-all duration-200 mt-2`}
            onClick={() => {
              navigate.push("/chat");
              if (isMobile) toggleSidebar();
            }}
          >
            <PlusCircle size={20} className="flex-shrink-0" />
            {((!isMobile && showSidebar) || isMobile) && (
              <span className="text-[14px] font-medium whitespace-nowrap">New Session</span>
            )}
          </button>
        </div>

        {/* Main Nav */}
        <div className="flex-1 overflow-y-auto px-3 space-y-8 scrollbar-none">
          <div className="space-y-1">
            <SidebarItem
              to="/chat"
              icon={<MessageSquare size={20} />}
              label="Intelligence Chat"
              active={pathname === "/chat"}
            />
            <SidebarItem
              to="/community"
              icon={<Users size={20} />}
              label="Community"
              active={pathname === "/community"}
            />
            <SidebarItem
              to="/jobs"
              icon={<Briefcase size={20} />}
              label="Mission Hunt"
              active={pathname === "/jobs"}
            />
            <SidebarItem
              to="/notifications"
              icon={<Bell size={20} />}
              label="Notification Hub"
              active={pathname === "/notifications"}
              badge={undefined} // Potential to add dynamic count later
            />
            <SidebarItem
              to="/subscription"
              icon={<Sparkles size={20} />}
              label="Upgrade Plan"
              active={pathname === "/subscription"}
              badge="Pro"
            />
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <SidebarItem
                to="/admin/marketing"
                icon={<Megaphone size={20} />}
                label="Marketing"
                active={pathname === "/admin/marketing"}
              />
            )}
          </div>

          {/* <div>
            <h3 className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Logs</h3>
            <div className="space-y-1">
              {[
                "Frontend Mastery Path",
                "Resume v2.4 Audit",
                "SWOT Analysis: Google"
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer group transition-colors">
                  <Clock size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="text-[13px] font-medium text-[#444746] truncate">{label}</span>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-50 mt-auto ${(!isMobile && !showSidebar) ? "px-2" : ""}`}>
          <div className={`flex items-center ${(!isMobile && !showSidebar) ? "justify-center p-2" : "gap-3 p-3"} rounded-2xl bg-gray-50 border border-gray-100 mb-4 transition-all hover:bg-white hover:border-primary/20 cursor-pointer group`} onClick={() => navigate.push("/profile")}>
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden text-primary font-bold">
              {user?.photoURL ? <img src={user.photoURL} alt="" /> : user?.displayName?.[0] || "U"}
            </div>
            {((!isMobile && showSidebar) || isMobile) && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#202124] truncate group-hover:text-primary transition-colors">{user?.displayName || "Cyber Identity"}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter truncate">Premium Access</p>
                </div>
                <Settings size={16} className="text-gray-400 group-hover:rotate-45 transition-transform" />
              </>
            )}
          </div>

          <button onClick={handleLogout} className={`flex items-center ${(!isMobile && !showSidebar) ? "justify-center" : "gap-3 px-5"} w-full py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-medium text-[14px]`}>
            <LogOut size={20} className="flex-shrink-0" />
            {((!isMobile && showSidebar) || isMobile) && (
              <span className="whitespace-nowrap">Logout System</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
