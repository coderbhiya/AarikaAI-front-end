"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { BookOpen, PlayCircle, PlusCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function MyLearningDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        
        // Ensure we handle case where courses might not exist yet
        setCourses(data.data.courses || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load learning profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden">
          <Sidebar />
          <SidebarInset className="flex-1 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-8 shadow-sm z-10">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="text-primary" size={24} /> My Learning
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search courses..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                  />
                </div>
                <button 
                  onClick={() => router.push("/chat?msg=Recommend%20me%20some%20courses")}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
                >
                  <PlusCircle size={16} /> Explore
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
              <div className="max-w-6xl mx-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading your workspace...</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                      <BookOpen size={40} className="text-primary/50" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses Yet</h2>
                    <p className="text-gray-500 mb-8 max-w-md text-center">
                      You haven't added any courses to your learning workspace yet. Explore courses with AarikaAI to get started.
                    </p>
                    <button 
                      onClick={() => router.push("/chat?msg=Recommend%20me%20some%20courses")}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                    >
                      Find Courses
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course, idx) => {
                      const isYouTube = course.platform.toLowerCase().includes("youtube");
                      return (
                        <div 
                          key={course.id || idx}
                          onClick={() => router.push(`/learning/${course.id}`)}
                          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group flex flex-col h-full"
                        >
                          <div className={`h-32 \${isYouTube ? 'bg-red-50' : 'bg-primary/5'} relative flex items-center justify-center`}>
                            {isYouTube ? (
                              <PlayCircle size={48} className="text-red-500/50 group-hover:scale-110 transition-transform" />
                            ) : (
                              <BookOpen size={48} className="text-primary/30 group-hover:scale-110 transition-transform" />
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                              {course.status}
                            </div>
                          </div>
                          
                          <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                {course.platform}
                              </span>
                              {course.isFree && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-1 rounded-md">
                                  Free
                                </span>
                              )}
                            </div>
                            
                            <h3 className="font-bold text-gray-900 leading-snug mb-4 line-clamp-2 flex-1">
                              {course.title}
                            </h3>
                            
                            <div className="mt-auto">
                              <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span className="font-medium">Progress</span>
                                <span className="font-bold text-primary">{course.progressPercentage || 0}%</span>
                              </div>
                              <Progress value={course.progressPercentage || 0} className="h-1.5 mb-4" />
                              
                              <button className="w-full py-2.5 bg-gray-50 text-gray-700 font-bold text-sm rounded-xl group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
                                <PlayCircle size={16} /> Continue Learning
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
