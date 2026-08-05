"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  SquarePen,
  Briefcase,
  LogOut,
  X,
  Settings,
  BookOpen,
  Sparkles,
  Megaphone,
  Users,
  Search,
  Pin,
  Archive,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeft,
  Pencil,
  Check,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BrainLogo from "./BrainLogo";
import { getEnabledFeatures } from "@/services/settingsService";
import {
  getConversations,
  searchConversations,
  updateConversation,
  Conversation,
} from "@/services/conversationService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupConversationsByDate(
  convos: Conversation[]
): { label: string; items: Conversation[] }[] {
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
  if (thisWeek.length) groups.push({ label: "Previous 7 Days", items: thisWeek });
  if (older.length) groups.push({ label: "Older", items: older });
  return groups;
}

// ─── Conversation Item ────────────────────────────────────────────────────────

interface ConversationItemProps {
  convo: Conversation;
  isActive: boolean;
  onOpen: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onArchive: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  convo,
  isActive,
  onOpen,
  onPin,
  onArchive,
  onRename,
}) => {
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
      className={`group relative flex items-center gap-0 pl-2 pr-1 py-1.5 rounded-lg cursor-pointer transition-colors duration-100 select-none ${
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-primary/5 text-gray-700"
      }`}
      onClick={() => !renaming && onOpen(convo.id)}
    >
      {/* Title / Rename input */}
      <div className="flex-1 min-w-0 flex items-center">
        {renaming ? (
          <div
            className="flex items-center gap-1 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="w-full text-[13px] bg-white border border-gray-300 rounded px-2 py-0.5 outline-none text-gray-900"
            />
            <button
              onClick={handleRenameSubmit}
              className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex-shrink-0"
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <span className="text-[13px] truncate leading-snug">
            {convo.isPinned && (
              <span className="mr-1 text-amber-500 text-[11px]">📌</span>
            )}
            {convo.title || "Untitled conversation"}
          </span>
        )}
      </div>

      {/* 3-dot action menu — visible on hover */}
      {!renaming && (
        <div
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-1 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-36 text-[12px]">
              <button
                onClick={() => {
                  setRenaming(true);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700"
              >
                <Pencil size={12} /> Rename
              </button>
              <button
                onClick={() => {
                  onPin(convo.id, !convo.isPinned);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700"
              >
                <Pin size={12} /> {convo.isPinned ? "Unpin" : "Pin"}
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  onArchive(convo.id);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-red-50 text-red-500"
              >
                <Archive size={12} /> Archive
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

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
    getEnabledFeatures()
      .then((flags) => {
        if (active) setFeatures(flags);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateConversation(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

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
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

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

  const handleNavClick = (to: string) => {
    navigate.push(to);
    if (isMobile) toggleSidebar();
  };

  const isOnChatPage = pathname === "/chat" || pathname?.startsWith("/chat");
  const isLearningWorkspace = pathname?.startsWith("/learning");
  const isExpanded = showSidebar || isMobile;

  const sidebarClasses = isMobile
    ? `fixed inset-0 z-50 ${showSidebar ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300`
    : `h-screen bg-white border-r border-gray-200/60 flex flex-col relative z-30 transition-all duration-300 ease-in-out select-none ${
        isLearningWorkspace
          ? showSidebar
            ? "w-[260px]"
            : "w-0 border-r-0 overflow-hidden"
          : showSidebar
          ? "w-[260px]"
          : "w-[56px]"
      }`;

  const displayConversations = searchResults !== null ? searchResults : null;

  // ── Nav link item (same visual weight as a history item) ──
  const NavLink = ({
    to,
    icon,
    label,
    active,
  }: {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
  }) => (
    <button
      onClick={() => handleNavClick(to)}
      title={!isExpanded ? label : undefined}
      className={`transition-colors duration-100 ${
        isExpanded
          ? "w-full flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-lg text-left"
          : "w-8 h-8 mx-auto flex items-center justify-center rounded-lg"
      } ${
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-700 hover:bg-primary/5 font-normal"
      }`}
    >
      <span className={`flex-shrink-0 flex items-center justify-center ${active ? "text-primary" : "text-gray-500"}`}>
        {icon}
      </span>
      {isExpanded && (
        <span className="text-[13px] truncate">{label}</span>
      )}
    </button>
  );

  return (
    <div className={sidebarClasses}>
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`${
          isMobile
            ? "fixed left-0 top-0 h-full w-[260px] bg-white z-50 border-r border-gray-200 flex flex-col"
            : "flex flex-col h-full"
        }`}
      >
        {/* ── Header ── */}
        <div
          className={`flex items-center ${
            isExpanded ? "justify-between px-3" : "justify-center px-0"
          } pt-3 pb-2 flex-shrink-0`}
        >
          {isExpanded ? (
            <>
              {/* Logo + Brand */}
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate.push("/chat")}
              >
                <div className="w-7 h-7 flex items-center justify-center overflow-hidden shrink-0">
                  <BrainLogo size={28} />
                </div>
                <span className="text-[14px] font-semibold text-gray-900 tracking-tight">
                  Aarika.AI
                </span>
              </div>
              {/* Collapse toggle */}
              <div className="flex items-center gap-1">
                {!isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-200/70 text-gray-500 hover:text-gray-800 transition-colors"
                    title="Collapse sidebar"
                  >
                    <PanelLeftClose size={17} />
                  </button>
                )}
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-200/70 text-gray-600"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Collapsed: just expand button */
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 mx-auto flex items-center justify-center rounded-lg hover:bg-gray-200/70 text-gray-600 transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft size={17} />
            </button>
          )}
        </div>

        {/* ── New Chat ── */}
        <div className={`flex-shrink-0 mt-2 mb-1 ${isExpanded ? "px-2" : "px-1.5"}`}>
          {isExpanded ? (
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors text-primary text-[13px] font-medium group"
            >
              <SquarePen size={16} className="text-primary/70 group-hover:text-primary transition-colors flex-shrink-0" />
              <span>New chat</span>
            </button>
          ) : (
            <button
              onClick={handleNewChat}
              className="w-8 h-8 mx-auto flex items-center justify-center rounded-lg hover:bg-gray-200/70 text-gray-600 transition-colors"
              title="New chat"
            >
              <SquarePen size={17} />
            </button>
          )}
        </div>

        {/* ── Unified Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 flex flex-col px-2">

          {/* ── Feature Navigation (ChatGPT-style: plain items, same weight as history) ── */}
          <div className="space-y-0.5 pt-1">
            <NavLink
              to="/chat"
              icon={<MessageSquare size={16} />}
              label="Chat"
              active={isOnChatPage && !activeThreadId}
            />
            {features.learningModuleEnabled && (
              <NavLink
                to="/dashboard/learning"
                icon={<BookOpen size={16} />}
                label="My Learning"
                active={pathname === "/dashboard/learning"}
              />
            )}
            {features.communityModuleEnabled && (
              <NavLink
                to="/community"
                icon={<Users size={16} />}
                label="Community"
                active={pathname === "/community"}
              />
            )}
            {features.jobRecommendationsEnabled && (
              <NavLink
                to="/jobs"
                icon={<Briefcase size={16} />}
                label="Mission Hunt"
                active={pathname === "/jobs"}
              />
            )}
            {(user?.role === "admin" || user?.role === "super_admin") && (
              <NavLink
                to="/admin/marketing"
                icon={<Megaphone size={16} />}
                label="Marketing"
                active={pathname === "/admin/marketing"}
              />
            )}
          </div>

          {/* ── Thin separator before chat history ── */}
          {isExpanded && (
            <div className="my-3 border-t border-gray-200/70" />
          )}

          {/* ── Chat History — flows directly below nav items ── */}
          {isExpanded && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Search */}
              <div className="relative mb-2">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-7 py-1 text-[12.5px] bg-primary/5 border border-primary/10 focus:border-primary/25 focus:bg-white rounded-lg outline-none transition-all text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto scrollbar-none space-y-0.5 pb-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                    <span className="text-[11.5px] text-gray-500">
                      Searching...
                    </span>
                  </div>
                ) : displayConversations !== null ? (
                  displayConversations.length === 0 ? (
                    <p className="text-center text-[12px] text-gray-400 py-4">
                      No chats found
                    </p>
                  ) : (
                    displayConversations.map((c) => (
                      <ConversationItem
                        key={c.id}
                        convo={c}
                        isActive={activeThreadId === c.id}
                        onOpen={handleOpenConversation}
                        onPin={(id, pinned) =>
                          updateMutation.mutate({ id, data: { isPinned: pinned } })
                        }
                        onArchive={(id) =>
                          updateMutation.mutate({ id, data: { isArchived: true } })
                        }
                        onRename={(id, title) =>
                          updateMutation.mutate({ id, data: { title } })
                        }
                      />
                    ))
                  )
                ) : conversations.length === 0 ? (
                  <p className="text-center text-[12px] text-gray-400 py-6">
                    No conversations yet
                  </p>
                ) : (
                  <>
                    {/* Pinned */}
                    {pinnedConvos.length > 0 && (
                      <div className="mb-1">
                        <p className="text-[11px] font-semibold text-amber-600 px-2 py-1.5 flex items-center gap-1">
                          <Pin size={10} /> Pinned
                        </p>
                        {pinnedConvos.map((c) => (
                          <ConversationItem
                            key={c.id}
                            convo={c}
                            isActive={activeThreadId === c.id}
                            onOpen={handleOpenConversation}
                            onPin={(id, pinned) =>
                              updateMutation.mutate({
                                id,
                                data: { isPinned: pinned },
                              })
                            }
                            onArchive={(id) =>
                              updateMutation.mutate({
                                id,
                                data: { isArchived: true },
                              })
                            }
                            onRename={(id, title) =>
                              updateMutation.mutate({ id, data: { title } })
                            }
                          />
                        ))}
                      </div>
                    )}

                    {/* Date groups */}
                    {grouped.map((group) => (
                      <div key={group.label} className="mb-1">
                        <p className="text-[11px] font-semibold text-gray-400 px-2 py-1.5">
                          {group.label}
                        </p>
                        {group.items.map((c) => (
                          <ConversationItem
                            key={c.id}
                            convo={c}
                            isActive={activeThreadId === c.id}
                            onOpen={handleOpenConversation}
                            onPin={(id, pinned) =>
                              updateMutation.mutate({
                                id,
                                data: { isPinned: pinned },
                              })
                            }
                            onArchive={(id) =>
                              updateMutation.mutate({
                                id,
                                data: { isArchived: true },
                              })
                            }
                            onRename={(id, title) =>
                              updateMutation.mutate({ id, data: { title } })
                            }
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

        {/* ── Footer: User Profile ── */}
        <div
          className={`flex-shrink-0 p-2 border-t border-gray-200/50 ${
            !isExpanded ? "px-1" : ""
          }`}
        >
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={`flex items-center ${
                  !isExpanded
                    ? "justify-center p-1.5"
                    : "gap-2.5 px-2 py-1.5"
                } rounded-lg hover:bg-gray-200/70 transition-colors cursor-pointer group`}
              >
                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs overflow-hidden">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.displayName?.[0] || "U"
                  )}
                </div>
                {isExpanded && (
                  <>
                    <p className="flex-1 min-w-0 text-[13px] font-medium text-gray-900 truncate leading-tight">
                      {user?.displayName || "User"}
                    </p>
                    <MoreHorizontal
                      size={14}
                      className="text-gray-400 group-hover:text-gray-700 transition-colors flex-shrink-0"
                    />
                  </>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align={!isExpanded ? "center" : "start"}
              className="p-1.5 rounded-xl shadow-lg border border-gray-200/70 bg-white mb-2 w-48"
            >
              <div className="flex flex-col gap-0.5 text-[12.5px]">
                <button
                  onClick={() => {
                    navigate.push("/profile");
                    if (isMobile) toggleSidebar();
                  }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-1.5 font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                >
                  <Settings size={14} className="text-gray-500" />
                  Settings & Profile
                </button>
                <button
                  onClick={() => {
                    navigate.push("/subscription");
                    if (isMobile) toggleSidebar();
                  }}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Upgrade Plan
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Pro
                  </span>
                </button>
                <div className="h-px bg-gray-100 my-1 mx-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
