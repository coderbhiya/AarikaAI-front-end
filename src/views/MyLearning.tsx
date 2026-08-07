"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, PlayCircle, PlusCircle, Search, Play, Check, Menu } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function MyLearning() {
  const router = useRouter();
  const { toggleSidebar } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${apiUrl}/profile/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();

        // Ensure we handle case where courses might not exist yet
        setCourses(data.courses || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load learning profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const filteredCourses = courses.filter(c => (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8F9FA]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row min-h-16 shrink-0 items-start sm:items-center justify-between border-b bg-white px-4 md:px-8 py-3 sm:py-0 shadow-sm z-10 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <BookOpen className="text-primary" size={22} /> My Learning
            </h1>
          </div>

          <button
            onClick={() => router.push("/chat?msg=Recommend%20me%20some%20courses")}
            className="sm:hidden flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
          >
            <PlusCircle size={14} /> Explore
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            onClick={() => router.push("/chat?msg=Recommend%20me%20some%20courses")}
            className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
          >
            <PlusCircle size={16} /> Explore
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin scrollbar-thumb-gray-200">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, idx) => {
                const isYouTube = (course.platform || "").toLowerCase().includes("youtube");

                const getYouTubeThumbnail = (url: string) => {
                  if (!url) return null;
                  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                  const videoId = match ? match[1] : null;
                  if (videoId && videoId.length === 11) {
                    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }
                  return null;
                };

                const thumbnailUrl = getYouTubeThumbnail(course.url);

                return (
                  <div
                    key={`${course.id || "course"}-${idx}`}
                    onClick={() => router.push(`/learning/${course.id}`)}
                    className="w-full cursor-pointer group flex flex-col gap-3.5 bg-[#F8FAFF] p-3.5 rounded-2xl border border-primary/10 transition-all duration-300 hover:bg-[#F0F4FF] hover:border-primary/20"
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video w-full rounded-[10px] overflow-hidden bg-gray-100 border border-gray-100/60 flex-shrink-0">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4 relative transition-transform duration-300 group-hover:scale-[1.02]">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-2">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold tracking-wider text-white/90 uppercase">
                            {course.platform} Course
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                        <div className="w-11 h-11 rounded-full bg-white/95 shadow-md flex items-center justify-center text-[#FF0000] transform scale-90 group-hover:scale-100 transition-all duration-200">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Duration / Status Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-medium text-white tracking-wide shadow-sm z-10">
                        {course.status === "Completed" || course.progressPercentage === 100
                          ? "Completed"
                          : course.progressPercentage > 0
                            ? `${course.progressPercentage}% watched`
                            : "Not Started"
                        }
                      </div>

                      {/* Watched Progress Bar */}
                      {course.progressPercentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                          <div
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${course.progressPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Metadata / Details */}
                    <div className="flex gap-3 px-1">
                      {isYouTube ? (
                        <div className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51a3.003 3.003 0 0 0-2.11 2.108C0 8.025 0 12 0 12s0 3.975.503 5.837a3.003 3.003 0 0 0 2.11 2.108c1.862.51 9.387.51 9.387.51s7.525 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white flex-shrink-0 font-bold text-sm shadow-sm">
                          {course.platform ? course.platform[0].toUpperCase() : 'C'}
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="font-semibold text-[#0F0F0F] text-[14px] leading-5 line-clamp-2 pr-2 mb-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>

                        <p className="text-[13px] text-[#606060] font-medium flex items-center">
                          {course.platform}
                          {isYouTube && (
                            <svg className="w-3.5 h-3.5 fill-[#606060] ml-1.5 flex-shrink-0" viewBox="0 0 24 24">
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1 1.4-1.4 2.8 2.7 7.4-7.4 1.4 1.4-8.8 8.8z" />
                            </svg>
                          )}
                        </p>

                        <p className="text-[13px] text-[#606060] font-normal mt-0.5">
                          {course.progressPercentage > 0 ? (
                            <span>{course.progressPercentage}% watched</span>
                          ) : (
                            <span>Not started</span>
                          )}
                          <span className="mx-1.5">•</span>
                          <span>{course.isFree ? 'Free' : 'Premium'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
