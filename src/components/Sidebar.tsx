import React from "react";
import { MessageSquare, Trash2, User, FileQuestion, LogOut, Plus, Search, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasMoreOptions?: boolean;
  to?: string;
  onClick?: () => void;
}

interface SidebarProps {
  onNewChat?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, hasMoreOptions }) => {
  return (
    <div className="flex items-center justify-between w-full py-3 px-4 hover:bg-white/5 transition-colors rounded-md cursor-pointer group">
      <div className={`flex items-center gap-3 ${active ? "text-white" : "text-gray-400"}`}>
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

const NewChatButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button className="flex items-center justify-between w-full gap-2 rounded-md bg-white/5 border border-white/10 py-3 px-4 hover:bg-white/10 transition-colors" onClick={onClick}>
      <span className="font-medium">Begin a New Chat</span>
      <Plus size={18} />
    </button>
  );
};

const SearchBar = () => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      <input type="text" placeholder="Search" className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20" />
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, isOpen = true, onClose }) => {
  const isMobile = useIsMobile();

  const sidebarClasses = isMobile ? `fixed inset-0 z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out` : "h-screen w-64 bg-sidebar border-r border-white/10 flex flex-col justify-between";

  return (
    <div className={sidebarClasses}>
      {isMobile && isOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={onClose} />}

      <div className={`${isMobile ? "fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-white/10 z-50" : ""} flex flex-col justify-between h-full`}>
        {isMobile && (
          <div className="flex justify-end p-4">
            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 p-4">
          <div className="mt-2 mb-4">
            <SearchBar />
          </div>

          <SidebarItem icon={<MessageSquare size={18} />} label="Chat " />

          {/*  */}
        </div>

        <div className="mt-auto p-4 space-y-2 border-t border-white/10">
          <SidebarItem icon={<User size={18} />} label="My account" />

          <SidebarItem icon={<LogOut size={18} />} label="Log out" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

