import React from "react";
import {
  MessageSquare,
  User,
  FileQuestion,
  LogOut,
  Search,
  X,
  Bell,
  Star,
  Settings,
  PlusCircle,
  Clock,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { toggleSidebar } = useAuth();

  const handleClick = () => {
    if (to) {
      navigate(to);
      toggleSidebar();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`flex items-center justify-between w-full py-2.5 px-3 transition-all duration-200 rounded-xl cursor-pointer group ${active
        ? "bg-white/[0.08] text-white"
        : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
        }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className={`transition-transform duration-200 group-hover:scale-110 ${active ? "text-primary" : ""}`}>
          {icon}
        </div>
        <span className="text-sm font-medium tracking-tight truncate">{label}</span>
      </div>
      {badge && (
        <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
  );
};

const Sidebar = () => {
  const isMobile = useIsMobile();
  const { logout, showSidebar, toggleSidebar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sidebarClasses = isMobile
    ? `fixed inset-0 z-50 ${showSidebar ? "translate-x-0" : "-translate-x-full"
    } transition-transform duration-300 ease-in-out`
    : "h-screen w-72 bg-[#0a0a0a] border-r border-white/[0.05] flex flex-col";

  return (
    <div className={sidebarClasses}>
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`${isMobile
          ? "fixed left-0 top-0 h-full w-72 bg-[#0a0a0a] border-r border-white/[0.05] z-50"
          : ""
          } flex flex-col h-full overflow-hidden`}
      >
        {/* Header/Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/chat")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg tracking-tight">AarikaAI</span>
              {/* <span className="text-xs text-primary font-bold tracking-widest uppercase">Beta</span> */}
            </div>
          </div>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Main Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          <div className="space-y-1">
            <button
              className="w-full flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-lg shadow-primary/10 group"
              onClick={() => {
                navigate("/chat");
                if (isMobile) toggleSidebar();
              }}
            >
              <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm font-semibold">New Chat</span>
            </button>

            <SidebarItem
              to="/chat"
              icon={<MessageSquare size={18} />}
              label="Chat"
              active={location.pathname === "/chat"}
            />
            <SidebarItem
              to="/jobs"
              icon={<FileQuestion size={18} />}
              label="Jobs"
              active={location.pathname === "/jobs"}
            />
            <SidebarItem
              to="/reviews"
              icon={<Star size={18} />}
              label="Reviews"
              active={location.pathname === "/reviews"}
            />
            <SidebarItem
              to="/notifications"
              icon={<Bell size={18} />}
              label="Notifications"
              active={location.pathname === "/notifications"}
              badge="New"
            />
          </div>

          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">History</h3>
            <div className="space-y-1 opacity-60">
              <SidebarItem icon={<Clock size={16} />} label="Resume Review" />
              <SidebarItem icon={<Clock size={16} />} label="Job Hunt Strategy" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.05] space-y-1 bg-[#0d0d0d]">
          <SidebarItem
            to="/profile"
            icon={<User size={18} />}
            label="My Account"
            active={location.pathname === "/profile"}
          />
          <SidebarItem
            onClick={handleLogout}
            icon={<LogOut size={18} />}
            label="Logout"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
