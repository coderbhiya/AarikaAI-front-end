"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Terminal,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  Key,
  RefreshCw,
  Eye,
  FileText,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  UserPlus,
  Briefcase,
  Server
} from "lucide-react";
import {
  adminLogin,
  adminRegister,
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  activatePrompt,
  getJobs as getAdminJobs,
  updateJobStatus,
  deleteJob
} from "@/services/adminService";
import ArchitectureGuide from "./ArchitectureGuide";

export default function AdminPanel() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Login/Register Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");

  // Dashboard & Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "prompts" | "jobs" | "architecture">("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Users Tab State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilterStatus, setUserFilterStatus] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Prompts Tab State
  const [promptsList, setPromptsList] = useState<any[]>([]);
  const [isPromptsLoading, setIsPromptsLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptForm, setPromptForm] = useState({
    id: "",
    title: "",
    content: "",
    type: "chat",
    classification: "DEFAULT",
    isActive: false
  });

  // Jobs Tab State
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [jobFilterStatus, setJobFilterStatus] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [jobTotalPages, setJobTotalPages] = useState(1);
  const [isJobsLoading, setIsJobsLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const userStr = localStorage.getItem("adminUser");
    if (token && userStr) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(userStr));
    }
    setIsLoading(false);
  }, []);

  // Fetch dashboard stats
  const fetchStats = async () => {
    setIsRefreshingStats(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setIsRefreshingStats(false);
    }
  };

  // Fetch users list
  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const data = await getUsers(userPage, 8, userSearch, userFilterStatus);
      setUsersList(data.users || []);
      setUserTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      toast.error("Failed to fetch users");
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Fetch prompts list
  const fetchPrompts = async () => {
    setIsPromptsLoading(true);
    try {
      const data = await getPrompts();
      setPromptsList(data || []);
    } catch (err: any) {
      toast.error("Failed to fetch prompts");
    } finally {
      setIsPromptsLoading(false);
    }
  };

  // Fetch jobs list
  const fetchJobs = async () => {
    setIsJobsLoading(true);
    try {
      const data = await getAdminJobs(jobPage, 8, jobSearch, jobFilterStatus);
      setJobsList(data.jobs || []);
      setJobTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      toast.error("Failed to fetch jobs");
    } finally {
      setIsJobsLoading(false);
    }
  };

  // Trigger fetches on tab changes
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "dashboard") fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "prompts") fetchPrompts();
    if (activeTab === "jobs") fetchJobs();
  }, [isAuthenticated, activeTab, userPage, userFilterStatus, jobPage, jobFilterStatus]);

  // Search debouncing
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "users") return;
    const delayDebounceFn = setTimeout(() => {
      setUserPage(1);
      fetchUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearch]);

  // Search debouncing for jobs
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "jobs") return;
    const delayDebounceFn = setTimeout(() => {
      setJobPage(1);
      fetchJobs();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [jobSearch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await adminLogin(email, password);
      setIsAuthenticated(true);
      setAdminUser(data.admin);
      toast.success("Welcome back to Administration Console!");
      setActiveTab("dashboard");
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await adminRegister({
        name,
        email,
        password,
        phone: phone || undefined,
        role: "admin",
        department: department || undefined
      });
      toast.success("Administrator account registered successfully! You can now log in.");
      setAuthMode("login");
      setPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setIsAuthenticated(false);
    setAdminUser(null);
    toast.success("Successfully logged out");
  };

  // User Management Handlers
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        isVerified: editingUser.isVerified
      });
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
      fetchStats(); // Update active/verified ratios
    } catch (err: any) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error("Failed to delete user");
    }
  };

  // Prompt Management Handlers
  const handleOpenPromptModal = (prompt: any = null) => {
    if (prompt) {
      setPromptForm({
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        type: prompt.type || "chat",
        classification: prompt.classification || "DEFAULT",
        isActive: prompt.isActive || false
      });
      setEditingPrompt(prompt);
    } else {
      setPromptForm({
        id: "",
        title: "",
        content: "",
        type: "chat",
        classification: "DEFAULT",
        isActive: false
      });
      setEditingPrompt(null);
    }
    setIsPromptModalOpen(true);
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, promptForm);
        toast.success("System prompt updated successfully");
      } else {
        await createPrompt(promptForm);
        toast.success("New system prompt created successfully");
      }
      setIsPromptModalOpen(false);
      fetchPrompts();
    } catch (err: any) {
      toast.error("Failed to save system prompt");
    }
  };

  const handleDeletePrompt = async (id: number) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    try {
      await deletePrompt(id);
      toast.success("Prompt deleted successfully");
      fetchPrompts();
    } catch (err: any) {
      toast.error("Failed to delete prompt");
    }
  };

  const handleActivatePrompt = async (id: number) => {
    try {
      await activatePrompt(id);
      toast.success("Prompt set as active system configuration");
      fetchPrompts();
    } catch (err: any) {
      toast.error("Failed to activate prompt");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin border-4 border-slate-200 border-t-blue-600 rounded-full" />
          <span className="text-sm font-medium text-slate-400">Loading Console...</span>
        </div>
      </div>
    );
  }

  // LOGIN / REGISTRATION VIEWS
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-100/50">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold tracking-tight text-slate-800 font-sans">
              AarikaAI <span className="text-blue-600">Console</span>
            </span>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {authMode === "login" ? "Enter administrator credentials" : "Create new administrator identity"}
            </p>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="admin@aarikaai.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99]"
              >
                Access Dashboard
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Need a new console identity? Register Admin
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="john.doe@aarikaai.in"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Phone (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Department (Optional)</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="Engineering / HR"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99]"
              >
                Register Account
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Already registered? Access Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // MAIN ADMIN CONSOLE VIEWS
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAF9F6]">
      {/* Sidebar - Frappe Style */}
      <aside className="w-64 bg-slate-900 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo */}
          <div className="px-6 py-6 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white text-sm">A</div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none tracking-wide uppercase">Aarika Console</h2>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">v3.0 (Frappe Layout)</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 mt-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Console Stats</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "users"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Users size={16} />
              <span>User Accounts</span>
            </button>

            <button
              onClick={() => setActiveTab("prompts")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "prompts"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Terminal size={16} />
              <span>Prompt Manager</span>
            </button>

            <button
              onClick={() => setActiveTab("jobs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "jobs"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Briefcase size={16} />
              <span>Job Listings</span>
            </button>

            <button
              onClick={() => setActiveTab("architecture")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "architecture"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Server size={16} />
              <span>Architecture Guide</span>
            </button>
          </nav>
        </div>

        {/* Footer Admin User */}
        <div className="px-4 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold uppercase">
              {adminUser?.name?.charAt(0) || "A"}
            </div>
            <div className="max-w-[130px] overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-none mb-0.5">{adminUser?.name || "Admin"}</p>
              <span className="text-[10px] text-slate-400 truncate block font-medium capitalize">{adminUser?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors active:scale-95"
            title="Log Out Console"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400 capitalize">Console</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-700 capitalize">
              {activeTab === "dashboard"
                ? "Dashboard Statistics"
                : activeTab === "users"
                ? "User Management"
                : activeTab === "prompts"
                ? "System Prompts"
                : activeTab === "architecture"
                ? "Architecture Guide"
                : "Job Listings"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === "dashboard" && (
              <button
                onClick={fetchStats}
                disabled={isRefreshingStats}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={12} className={isRefreshingStats ? "animate-spin" : ""} />
                Refresh Metrics
              </button>
            )}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Console Connected</span>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* TAB 1: DASHBOARD STATS */}
          {activeTab === "dashboard" && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Users</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mt-3">{stats?.totalUsers ?? 0}</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-emerald-600">
                    <TrendingUp size={12} />
                    <span>+{stats?.recentRegistrations ?? 0} new this week</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Profile Users</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mt-3">{stats?.activeUsers ?? 0}</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-2">
                    {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% verification ratio
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Jobs</span>
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><FileText size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mt-3">{stats?.totalJobs ?? 0}</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-2">Matched to user profiles</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Console Admins</span>
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Key size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mt-3">{stats?.totalAdmins ?? 0}</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-2">With database write access</p>
                </div>
              </div>

              {/* Quick Summary Section */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Aarika AI Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Registration Trends</h4>
                    {stats?.userGrowthData && stats.userGrowthData.length > 0 ? (
                      <div className="space-y-3.5 pt-2">
                        {stats.userGrowthData.map((data: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">{data.month}</span>
                            <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${Math.min(100, (data.users / (stats.totalUsers || 1)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{data.users} users</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No registrations statistics recorded yet.</p>
                    )}
                  </div>

                  <div className="space-y-4 md:pl-8 pt-4 md:pt-0">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Console Shortcuts</h4>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => setActiveTab("prompts")}
                        className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl text-left transition-colors"
                      >
                        <Terminal className="text-blue-500 mb-2" size={20} />
                        <h5 className="text-xs font-bold text-slate-700">Modify Prompts</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Edit system AI prompts</p>
                      </button>
                      <button
                        onClick={() => setActiveTab("users")}
                        className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl text-left transition-colors"
                      >
                        <Users className="text-emerald-500 mb-2" size={20} />
                        <h5 className="text-xs font-bold text-slate-700">Inspect Users</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Verify and audit users</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
              {/* Header and Filter */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="Search users by name or email..."
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={userFilterStatus}
                  onChange={(e) => {
                    setUserPage(1);
                    setUserFilterStatus(e.target.value);
                  }}
                  className="w-full md:w-44 px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs outline-none text-slate-600 focus:border-blue-500 focus:bg-white"
                >
                  <option value="">All Verification Status</option>
                  <option value="verified">Verified Profiles Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {isUsersLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="h-8 w-8 animate-spin border-4 border-slate-100 border-t-blue-500 rounded-full" />
                    <span className="text-xs text-slate-400">Fetching accounts...</span>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 italic text-xs">
                    No users matching the filters were found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Details</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {usersList.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-xs font-bold text-slate-500">#{user.id}</td>
                            <td className="px-6 py-4">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 leading-snug">{user.name}</h4>
                                <span className="text-[10px] text-slate-400 font-medium block">{user.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600 font-medium">{user.phone || "-"}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-slate-100 text-slate-500 border border-slate-200">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-150">
                                  <CheckCircle2 size={10} /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                                  <XCircle size={10} /> Unverified
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="p-1 bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-500 rounded-md transition-colors"
                                  title="Edit user details"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1 bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-500 rounded-md transition-colors"
                                  title="Delete user account"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {userTotalPages > 1 && (
                  <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Page {userPage} of {userTotalPages}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                        disabled={userPage === 1}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setUserPage((prev) => Math.min(userTotalPages, prev + 1))}
                        disabled={userPage === userTotalPages}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Editing User Modal */}
              {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
                  <div className="w-full max-w-md bg-white border border-slate-100 rounded-xl p-6 shadow-2xl">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                      Edit User Profile
                    </h3>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-between py-2 border-y border-slate-100">
                        <span className="text-xs font-bold text-slate-600">Verification Status</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser({ ...editingUser, isVerified: true })}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md border ${
                              editingUser.isVerified
                                ? "bg-blue-50 text-blue-600 border-blue-400"
                                : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Verified
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUser({ ...editingUser, isVerified: false })}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md border ${
                              !editingUser.isVerified
                                ? "bg-slate-200 text-slate-600 border-slate-300"
                                : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Unverified
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMPTS MANAGEMENT */}
          {activeTab === "prompts" && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
              {/* Header and Add Button */}
              <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Configured system prompts ({promptsList.length})
                </span>
                <button
                  onClick={() => handleOpenPromptModal(null)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Plus size={14} /> New Prompt
                </button>
              </div>

              {/* Prompts Cards Grid */}
              {isPromptsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="h-8 w-8 animate-spin border-4 border-slate-100 border-t-blue-500 rounded-full" />
                  <span className="text-xs text-slate-400">Loading system prompts...</span>
                </div>
              ) : promptsList.length === 0 ? (
                <div className="bg-white border border-slate-200 text-center py-16 text-slate-400 italic text-xs rounded-xl">
                  No prompts are currently configured in the database.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {promptsList.map((prompt) => (
                    <div
                      key={prompt.id}
                      className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                        prompt.isActive ? "border-blue-400 ring-2 ring-blue-50" : "border-slate-200"
                      }`}
                    >
                      <div>
                        {/* Title, Badge & Active Switch */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">{prompt.title}</h4>
                            <div className="flex gap-1.5 mt-1">
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight bg-slate-100 text-slate-500 border border-slate-200">
                                {prompt.type}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight bg-blue-50 text-blue-500 border border-blue-100">
                                {prompt.classification || "DEFAULT"}
                              </span>
                            </div>
                          </div>

                          <div>
                            {prompt.isActive ? (
                              <button
                                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full"
                                disabled
                              >
                                <CheckCircle2 size={10} /> Active
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivatePrompt(prompt.id)}
                                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full transition-all active:scale-95"
                              >
                                Set Active
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content Snippet */}
                        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-3 max-h-40 overflow-y-auto">
                          <p className="text-[11px] font-mono text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {prompt.content}
                          </p>
                        </div>
                      </div>

                      {/* Footer Info and Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-5">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Updated: {new Date(prompt.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenPromptModal(prompt)}
                            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-500 rounded-md transition-colors"
                            title="Edit prompt text"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-500 rounded-md transition-colors"
                            title="Delete prompt"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Prompt Modal */}
              {isPromptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
                  <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex-shrink-0">
                      {editingPrompt ? "Edit System Prompt" : "Create New System Prompt"}
                    </h3>
                    <form onSubmit={handleSavePrompt} className="space-y-4 overflow-y-auto flex-1 pr-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                          <input
                            type="text"
                            required
                            value={promptForm.title}
                            onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
                            placeholder="e.g. Chat System Prompt v1"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Classification</label>
                          <input
                            type="text"
                            required
                            value={promptForm.classification}
                            onChange={(e) => setPromptForm({ ...promptForm, classification: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
                            placeholder="e.g. DEFAULT, ONBOARDING, STRATEGIST"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                          <select
                            value={promptForm.type}
                            onChange={(e) => setPromptForm({ ...promptForm, type: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white text-slate-600"
                          >
                            <option value="chat">Chat</option>
                            <option value="system">System</option>
                            <option value="skill">Skill</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="flex items-center pt-5 pl-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={promptForm.isActive}
                              onChange={(e) => setPromptForm({ ...promptForm, isActive: e.target.checked })}
                              className="rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-600">Activate Immediately</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prompt Content</label>
                        <textarea
                          required
                          rows={12}
                          value={promptForm.content}
                          onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
                          className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500 focus:bg-white leading-relaxed whitespace-pre-wrap"
                          placeholder="You are an AI career strategizing assistant..."
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsPromptModalOpen(false)}
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Save Configuration
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: JOB LISTINGS MANAGEMENT */}
          {activeTab === "jobs" && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
              {/* Header and Filter */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="Search jobs by title or company..."
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={jobFilterStatus}
                  onChange={(e) => {
                    setJobPage(1);
                    setJobFilterStatus(e.target.value);
                  }}
                  className="w-full md:w-44 px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs outline-none text-slate-600 focus:border-blue-500 focus:bg-white"
                >
                  <option value="">All Job Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Jobs Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {isJobsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="h-8 w-8 animate-spin border-4 border-slate-100 border-t-blue-500 rounded-full" />
                    <span className="text-xs text-slate-400">Fetching jobs...</span>
                  </div>
                ) : jobsList.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 italic text-xs">
                    No jobs matching the filters were found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Details</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location / Type</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Range</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Added On</th>
                          <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {jobsList.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-xs font-bold text-slate-500">#{job.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {job.companyLogo ? (
                                  <img
                                    src={job.companyLogo}
                                    alt={job.company}
                                    className="w-8 h-8 rounded bg-slate-50 border border-slate-100 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                                    {job.company?.charAt(0) || "J"}
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{job.title}</h4>
                                  {job.companyWebsite ? (
                                    <a
                                      href={job.companyWebsite}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-blue-500 hover:underline font-medium block"
                                    >
                                      {job.company}
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-medium block">{job.company}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <span className="text-xs text-slate-700 font-medium block">{job.location || "Remote"}</span>
                                <span className="text-[10px] text-slate-400 capitalize">{job.employmentType || "Full-time"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600 font-semibold">
                              {job.jobSalary ? (
                                <span>{job.jobSalary}</span>
                              ) : job.jobMinSalary || job.jobMaxSalary ? (
                                <span>
                                  {job.jobMinSalary || "0"} - {job.jobMaxSalary || "N/A"}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">Not Specified</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={job.status || "active"}
                                onChange={async (e) => {
                                  try {
                                    await updateJobStatus(job.id, e.target.value);
                                    toast.success("Job status updated successfully");
                                    fetchJobs();
                                  } catch (err: any) {
                                    toast.error(err.response?.data?.message || "Failed to update job status");
                                  }
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-tight py-1 px-2 outline-none cursor-pointer focus:border-blue-500 text-slate-600"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="expired">Expired</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {job.link && (
                                  <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-500 rounded-md transition-colors inline-block"
                                    title="View Original Job Link"
                                  >
                                    <Eye size={14} />
                                  </a>
                                )}
                                <button
                                  onClick={async () => {
                                    if (!confirm("Are you sure you want to permanently delete this job listing?")) return;
                                    try {
                                      await deleteJob(job.id);
                                      toast.success("Job listing deleted successfully");
                                      fetchJobs();
                                    } catch (err: any) {
                                      toast.error(err.response?.data?.message || "Failed to delete job");
                                    }
                                  }}
                                  className="p-1 bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-500 rounded-md transition-colors"
                                  title="Delete job listing"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {jobTotalPages > 1 && (
                  <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Page {jobPage} of {jobTotalPages}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setJobPage((prev) => Math.max(1, prev - 1))}
                        disabled={jobPage === 1}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setJobPage((prev) => Math.min(jobTotalPages, prev + 1))}
                        disabled={jobPage === jobTotalPages}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ARCHITECTURE GUIDE */}
          {activeTab === "architecture" && (
            <ArchitectureGuide />
          )}
        </div>
      </main>
    </div>
  );
}
