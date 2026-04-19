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
  ArrowUpRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BrainLogo from "./BrainLogo";

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
  const { toggleSidebar } = useAuth();
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
      className={`group flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl cursor-pointer transition-all duration-200 ${active
        ? "bg-primary/10 text-primary"
        : "text-[#444746] hover:bg-gray-100"
        }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className={`transition-colors ${active ? "text-primary" : "text-gray-400 group-hover:text-[#202124]"}`}>
          {icon}
        </div>
        <span className={`text-[14px] font-medium transition-colors ${active ? "text-primary font-semibold" : "group-hover:text-[#202124]"}`}>
          {label}
        </span>
      </div>

      {badge && (
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
    : `h-screen bg-white border-r border-gray-100 flex flex-col relative z-30 transition-all duration-300 ease-in-out ${showSidebar ? "w-64" : "w-0 overflow-hidden opacity-0"
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
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate.push("/chat")}>
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <BrainLogo size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#202124] tracking-tight leading-none mb-1">Aarika.AI</h1>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Strategic Intel</p>
            </div>
          </div>
          {isMobile && (
            <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className="px-4 mb-8">
          <button
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F0F4F9] hover:bg-[#D3E3FD] text-[#041E49] transition-all duration-200 mt-2"
            onClick={() => {
              navigate.push("/chat");
              if (isMobile) toggleSidebar();
            }}
          >
            <PlusCircle size={20} />
            <span className="text-[14px] font-medium">New Session</span>
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
              to="/jobs"
              icon={<Briefcase size={20} />}
              label="Mission Hunt"
              active={pathname === "/jobs"}
            />
            <SidebarItem
              to="/profile"
              icon={<User size={20} />}
              label="Digital Identity"
              active={pathname === "/profile"}
            />
          </div>

          <div>
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
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-4 transition-all hover:bg-white hover:border-primary/20 cursor-pointer group" onClick={() => navigate.push("/profile")}>
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden text-primary font-bold">
              {user?.photoURL ? <img src={user.photoURL} alt="" /> : user?.displayName?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#202124] truncate group-hover:text-primary transition-colors">{user?.displayName || "Cyber Identity"}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-tighter truncate">Premium Access</p>
            </div>
            <Settings size={16} className="text-gray-400 group-hover:rotate-45 transition-transform" />
          </div>

          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-medium text-[14px]">
            <LogOut size={20} />
            Logout System
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
