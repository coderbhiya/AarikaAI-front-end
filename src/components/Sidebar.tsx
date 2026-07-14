"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  User,
  Briefcase,
  LogOut,
  X,
  Bell,
  Settings,
  PlusCircle,
  BookOpen,
  Sparkles,
  Megaphone,
  Users,
  Search,
  Pin,
  Archive,
  MoreHorizontal,
  ChevronDown,
  Clock,
  Pencil,
  Check,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BrainLogo from "./BrainLogo";
import { getEnabledFeatures } from "@/services/settingsService";
import { getConversations, searchConversations, updateConversation, Conversation } from "@/services/conversationService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function groupConversationsByDate(convos: Conversation[]): { label: string; items: Conversation[] }[] {
  const now = new Date();
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const thisWeek: Conversation[] = [];
  const older: Conversation[] = [];

  convos.forEach((c) => {
    const date = new Date(c.updatedAt);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays < 1) today.push(c);
    else if (diffDays < 2) yesterday.push(c);
    else if (diffDays < 7) thisWeek.push(c);
    else older.push(c);
  });

  const groups: { label: string; items: Conversation[] }[] = [];
  if (today.length) groups.push({ label: "Today", items: today });
  if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
  if (thisWeek.length) groups.push({ label: "This Week", items: thisWeek });
  if (older.length) groups.push({ label: "Earlier", items: older });
  return groups;
}

// ─── Conversation Item ───────────────────────────────────────────────────────

interface ConversationItemProps {
  convo: Conversation;
  isActive: boolean;
  onOpen: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onArchive: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ convo, isActive, onOpen, onPin, onArchive, onRename }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(convo.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleRenameSubmit = () => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== convo.title) onRename(convo.id, trimmed);
    setRenaming(false);
  };

  return (
    <div
      className={`group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 select-none ${
        isActive ? "bg-primary/10 border border-primary/15" : "hover:bg-gray-50 border border-transparent"
      }`}
      onClick={() => !renaming && onOpen(convo.id)}
    >
      {/* Icon */}
      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-400"}`}>
        <MessageSquare size={14} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {renaming ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="flex-1 text-[12px] font-semibold bg-white border border-primary/30 rounded-md px-2 py-0.5 outline-none text-[#202124]"
            />
            <button
              onClick={handleRenameSubmit}
              className="p-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <p className={`text-[12.5px] font-semibold truncate leading-tight ${isActive ? "text-primary" : "text-[#1f2937]"}`}>
            {convo.isPinned && <span className="mr-1 text-amber-500">📌</span>}
            {convo.title || "Untitled conversation"}
          </p>
        )}

        <div className="flex items-center justify-between mt-0.5 gap-1">
          <p className="text-[11px] text-gray-400 truncate flex-1 leading-tight font-medium">
            {convo.lastMessage
              ? convo.lastMessage.replace(/\[.*?\].*?\[\/.*?\]/g, "[Card]").substring(0, 42)
              : `${convo.messageCount || 0} messages`}
          </p>
          <span className="text-[10px] text-gray-300 flex-shrink-0 font-medium">
            {formatRelativeTime(convo.updatedAt)}
          </span>
        </div>
      </div>

      {/* Three-dot menu */}
      <div
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>

        {showMenu && (
          <div className="absolute right-2 top-8 z-50 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 w-40 text-[12px]">
            <button
              onClick={() => { setRenaming(true); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Pencil size={12} /> Rename
            </button>
            <button
              onClick={() => { onPin(convo.id, !convo.isPinned); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Pin size={12} /> {convo.isPinned ? "Unpin" : "Pin"}
            </button>
            <div className="border-t border-gray-50 my-1" />
            <button
              onClick={() => { onArchive(convo.id); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-red-50 text-red-500 transition-colors"
            >
              <Archive size={12} /> Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Nav Item ────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to?: string;
  onClick?: () => void;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, to, onClick, badge }) => {
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
      className={`group flex items-center ${(!isMobile && !showSidebar) ? "justify-center px-0" : "justify-between px-3.5"} w-full py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        active ? "bg-primary/10 text-primary" : "text-[#444746] hover:bg-gray-100"
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
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </div>
  );
};

// ─── Main Sidebar ────────────────────────────────────────────────────────────

const Sidebar = () => {
  const isMobile = useIsMobile();
  const { logout, showSidebar, toggleSidebar, user } = useAuth();
  const navigate = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeThreadId = searchParams.get("threadId");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Conversation[] | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [features, setFeatures] = useState({
    chatEnabled: true,
    jobRecommendationsEnabled: true,
    profileAnalysisEnabled: true,
    resumeBuilderEnabled: true,
    learningModuleEnabled: true,
    communityModuleEnabled: true,
  });

  React.useEffect(() => {
    let active = true;
    getEnabledFeatures().then((flags) => { if (active) setFeatures(flags); }).catch(() => {});
    return () => { active = false; };
  }, []);

  // Fetch all conversations
  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(1, 100),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const conversations = conversationsData?.conversations || [];
  const pinnedConvos = conversations.filter((c) => c.isPinned);
  const unpinnedConvos = conversations.filter((c) => !c.isPinned);
  const grouped = groupConversationsByDate(unpinnedConvos);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateConversation(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  // Search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchConversations(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  // Invalidate conversations list whenever a new message is sent
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, [activeThreadId]);

  const handleOpenConversation = (id: string) => {
    navigate.push(`/chat?threadId=${id}`);
    if (isMobile) toggleSidebar();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleNewChat = () => {
    navigate.push("/chat");
    if (isMobile) toggleSidebar();
  };

  const isOnChatPage = pathname === "/chat" || pathname?.startsWith("/chat");
  const isLearningWorkspace = pathname?.startsWith("/learning");

  const sidebarClasses = isMobile
    ? `fixed inset-0 z-50 ${showSidebar ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300`
    : `h-screen bg-white border-r border-gray-100 flex flex-col relative z-30 transition-all duration-300 ease-in-out ${
        isLearningWorkspace
          ? showSidebar ? "w-64" : "w-0 border-r-0 overflow-hidden"
          : showSidebar ? "w-64" : "w-[72px]"
      }`;

  const displayConversations = searchResults !== null ? searchResults : null;
  const showChatHistory = showSidebar || isMobile;

  return (
    <div className={sidebarClasses}>
      {isMobile && showSidebar && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40" onClick={toggleSidebar} />
      )}

      <div className={`${isMobile ? "fixed left-0 top-0 h-full w-72 bg-white z-50 border-r border-gray-100 flex flex-col" : "flex flex-col h-full"}`}>
        
        {/* ── Header ── */}
        <div className={`p-4 flex items-center ${showSidebar ? "justify-between" : "justify-center px-0"} relative flex-shrink-0`}>
          {(!isMobile && !showSidebar) ? (
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => navigate.push("/chat")}>
              <BrainLogo size={40} />
            </div>
          ) : (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate.push("/chat")}>
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <BrainLogo size={40} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#202124] tracking-tight leading-none mb-0.5">Aarika.AI</h1>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Strategic Intel</p>
              </div>
            </div>
          )}
          {isMobile && (
            <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── New Chat Button ── */}
        <div className={`px-3 mb-3 flex-shrink-0 ${(!isMobile && !showSidebar) ? "px-2" : ""}`}>
          <button
            className={`w-full flex items-center ${(!isMobile && !showSidebar) ? "justify-center p-3" : "gap-2.5 px-4 py-2.5"} rounded-xl bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm font-semibold text-[13px]`}
            onClick={handleNewChat}
          >
            <PlusCircle size={16} className="flex-shrink-0" />
            {showChatHistory && <span className="whitespace-nowrap">New Chat</span>}
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-2 flex flex-col gap-1 min-h-0">

          {/* ── Navigation Items ── */}
          <div className="space-y-0.5 mb-3">
            <SidebarItem to="/chat" icon={<MessageSquare size={18} />} label="Intelligence Chat" active={isOnChatPage && !activeThreadId} />
            {features.communityModuleEnabled && (
              <SidebarItem to="/community" icon={<Users size={18} />} label="Community" active={pathname === "/community"} />
            )}
            {features.learningModuleEnabled && (
              <SidebarItem to="/dashboard/learning" icon={<BookOpen size={18} />} label="My Learning" active={pathname === "/dashboard/learning"} />
            )}
            {features.jobRecommendationsEnabled && (
              <SidebarItem to="/jobs" icon={<Briefcase size={18} />} label="Mission Hunt" active={pathname === "/jobs"} />
            )}
            <SidebarItem to="/notifications" icon={<Bell size={18} />} label="Notification Hub" active={pathname === "/notifications"} />
            <SidebarItem to="/subscription" icon={<Sparkles size={18} />} label="Upgrade Plan" active={pathname === "/subscription"} badge="Pro" />
            {(user?.role === "admin" || user?.role === "super_admin") && (
              <SidebarItem to="/admin/marketing" icon={<Megaphone size={18} />} label="Marketing" active={pathname === "/admin/marketing"} />
            )}
          </div>

          {/* ── Chat History (only when expanded) ── */}
          {showChatHistory && (
            <div className="flex flex-col min-h-0 flex-1">
              {/* Divider + label */}
              <div className="flex items-center gap-2 px-1 mb-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Chat History</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Search bar */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-[12px] bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-primary/30 focus:bg-white transition-all placeholder-gray-400 text-[#1f2937] font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto scrollbar-none space-y-0.5 pr-0.5">
                {isSearching ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-[11px] text-gray-400 font-medium">Searching...</span>
                  </div>
                ) : displayConversations !== null ? (
                  displayConversations.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-[12px] text-gray-400 font-medium">No chats found</p>
                    </div>
                  ) : (
                    displayConversations.map((c) => (
                      <ConversationItem
                        key={c.id}
                        convo={c}
                        isActive={activeThreadId === c.id}
                        onOpen={handleOpenConversation}
                        onPin={(id, pinned) => updateMutation.mutate({ id, data: { isPinned: pinned } })}
                        onArchive={(id) => updateMutation.mutate({ id, data: { isArchived: true } })}
                        onRename={(id, title) => updateMutation.mutate({ id, data: { title } })}
                      />
                    ))
                  )
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <MessageSquare size={18} className="text-gray-300" />
                    </div>
                    <p className="text-[12px] text-gray-400 font-medium">No conversations yet</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">Start a new chat to begin</p>
                  </div>
                ) : (
                  <>
                    {/* Pinned */}
                    {pinnedConvos.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-1 mb-1 flex items-center gap-1">
                          <Pin size={9} /> Pinned
                        </p>
                        {pinnedConvos.map((c) => (
                          <ConversationItem
                            key={c.id}
                            convo={c}
                            isActive={activeThreadId === c.id}
                            onOpen={handleOpenConversation}
                            onPin={(id, pinned) => updateMutation.mutate({ id, data: { isPinned: pinned } })}
                            onArchive={(id) => updateMutation.mutate({ id, data: { isArchived: true } })}
                            onRename={(id, title) => updateMutation.mutate({ id, data: { title } })}
                          />
                        ))}
                      </div>
                    )}

                    {/* Date-grouped */}
                    {grouped.map((group) => (
                      <div key={group.label} className="mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1">
                          {group.label}
                        </p>
                        {group.items.map((c) => (
                          <ConversationItem
                            key={c.id}
                            convo={c}
                            isActive={activeThreadId === c.id}
                            onOpen={handleOpenConversation}
                            onPin={(id, pinned) => updateMutation.mutate({ id, data: { isPinned: pinned } })}
                            onArchive={(id) => updateMutation.mutate({ id, data: { isArchived: true } })}
                            onRename={(id, title) => updateMutation.mutate({ id, data: { title } })}
                          />
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer: User + Logout ── */}
        <div className={`p-3 border-t border-gray-50 mt-auto flex-shrink-0 ${(!isMobile && !showSidebar) ? "px-2" : ""}`}>
          <div
            className={`flex items-center ${(!isMobile && !showSidebar) ? "justify-center p-2" : "gap-3 p-3"} rounded-xl bg-gray-50 border border-gray-100 mb-2 transition-all hover:bg-white hover:border-primary/20 cursor-pointer group`}
            onClick={() => navigate.push("/profile")}
          >
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden text-primary font-bold text-sm">
              {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : user?.displayName?.[0] || "U"}
            </div>
            {((!isMobile && showSidebar) || isMobile) && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#202124] truncate group-hover:text-primary transition-colors">{user?.displayName || "User"}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter truncate">Premium Access</p>
                </div>
                <Settings size={14} className="text-gray-400 group-hover:rotate-45 transition-transform flex-shrink-0" />
              </>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`flex items-center ${(!isMobile && !showSidebar) ? "justify-center" : "gap-3 px-4"} w-full py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-[13px]`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {((!isMobile && showSidebar) || isMobile) && <span className="whitespace-nowrap">Logout System</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
