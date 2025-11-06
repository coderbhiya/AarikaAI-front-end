import React from "react";
import {
  MessageSquare,
  User,
  FileQuestion,
  LogOut,
  Search,
  X,
  Bell, Star,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasMoreOptions?: boolean;
  to?: string;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  hasMoreOptions,
  to,
  onClick,
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
      className="flex items-center justify-between w-full py-3 px-4 hover:bg-white/5 transition-colors rounded-md cursor-pointer group "
      onClick={handleClick}
    >
      <div
        className={`flex items-center gap-3 ${
          active ? "text-white" : "text-gray-400"
        }`}
      >
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {hasMoreOptions && (
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded">
          <span className="text-gray-400">···</span>
        </button>
      )}
    </div>
  );
};

const SearchBar = () => {
  return (
    <div className="relative border-b border-white/10 pb-4">
      <div className="flex items-center">
        <img
          src="/favicon.ico"
          className="w-[50px] h-[50px] mr-3"
          alt="Brain Icon"
        />
        <span className="inline-flex items-center bg-white/10 rounded-md px-2 text-xs font-semibold text-white">
          <span className="text-lg font-bold">CareerAI</span>
          <span className="ml-2 bg-gray-500 rounded-full px-1 text-white">
            <span className="text-white font-bold">Beta</span>
          </span>
        </span>
      </div>
      {/* <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      <input type="text" placeholder="Search" className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20" /> */}
    </div>
  );
};

const Sidebar = () => {
  const isMobile = useIsMobile();
  const { logout, showSidebar, toggleSidebar } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sidebarClasses = isMobile
    ? `fixed inset-0 z-50 ${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`
    : "h-screen w-64 bg-sidebar border-r border-white/10 flex flex-col justify-between";

  return (
    <div className={sidebarClasses}>
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`${
          isMobile
            ? "fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-white/10 z-50"
            : ""
        } flex flex-col justify-between h-full`}
      >
        {isMobile && (
          <div className="flex justify-end p-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 p-4">
          <div className="mt-2 mb-4">
            <SearchBar />
          </div>

          <SidebarItem
            to="/chat"
            icon={<MessageSquare size={18} />}
            label="Chat "
          />
          <SidebarItem
            to="/jobs"
            icon={<FileQuestion size={18} />}
            label="Job Recommendation"
          />
          <SidebarItem to="/reviews" icon={<Star size={18} />} label="Reviews" />

          <SidebarItem
            to="/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
          />
        </div>

        <div className="mt-auto p-4 space-y-2 border-t border-white/10">
          <SidebarItem
            to="/profile"
            icon={<User size={18} />}
            label="My account"
          />

          <SidebarItem
            onClick={handleLogout}
            icon={<LogOut size={18} />}
            label="Log out"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
