"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ArrowLeft, BookOpen, CheckCircle, ExternalLink, MessageCircle, PlayCircle, Star, Video } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import ChatArea from "@/components/ChatArea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function LearningWorkspace() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        
        // Find the specific course
        const found = data.data.courses.find((c: any) => String(c.id) === String(courseId));
        if (found) {
          setCourse(found);
        } else {
          toast.error("Course not found in your learning profile.");
          router.push("/profile");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, router]);

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|playlist\?list=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const isPlaylist = course?.url?.includes("playlist");
  const youtubeId = extractYoutubeId(course?.url);

  if (loading) return <div className="h-screen w-full flex items-center justify-center">Loading Workspace...</div>;
  if (!course) return null;

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden bg-[#f3f4f6]">
          <Sidebar />
          <SidebarInset className="flex-1 overflow-hidden">
            <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">{course.title}</h1>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-semibold text-primary">{course.platform}</span>
                    <span>•</span>
                    <span>{course.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <CheckCircle size={14} className="text-green-500" />
                  {course.progressPercentage}% Completed
                </div>
                <Progress value={course.progressPercentage} className="w-24 h-2" />
              </div>
            </header>

            <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-3.5rem)]">
              {/* Left Panel: Course Content */}
              <ResizablePanel defaultSize={70} minSize={40} className="bg-gray-50 flex flex-col h-full overflow-y-auto">
                <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
                  {/* Video Player Area */}
                  {course.platform.toLowerCase().includes("youtube") && youtubeId ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black border border-gray-200">
                      <iframe
                        width="100%"
                        height="100%"
                        src={isPlaylist 
                          ? `https://www.youtube.com/embed/videoseries?list=${youtubeId}` 
                          : `https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-2xl bg-gray-200 flex flex-col items-center justify-center shadow-inner border border-gray-300">
                      <Video size={48} className="text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">External Course Content</p>
                      <a 
                        href={course.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all"
                      >
                        <ExternalLink size={18} />
                        Open in {course.platform}
                      </a>
                    </div>
                  )}

                  {/* Course Details */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                          <PlayCircle size={14} className="text-primary" /> {course.platform}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                          <BookOpen size={14} className="text-orange-500" /> {course.language}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 font-bold">
                          {course.isFree ? "Free" : "Paid"}
                        </span>
                      </div>
                      
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4">About this Course</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          This is your dedicated learning workspace. Watch the videos above, and use the Aarika AI tutor on the right to ask questions, generate summaries, or clarify difficult concepts. The AI is fully aware that you are learning {course.title}.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Star size={18} className="text-yellow-500" />
                          Learning Progress
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Completion</span>
                              <span className="font-bold text-primary">{course.progressPercentage}%</span>
                            </div>
                            <Progress value={course.progressPercentage} className="h-2" />
                          </div>
                          <button className="w-full py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors">
                            Update Progress
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Right Panel: Aarika Tutor */}
              <ResizablePanel defaultSize={30} minSize={25} className="bg-white flex flex-col h-full border-l">
                <div className="p-4 border-b bg-primary/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Aarika AI Tutor</h3>
                    <p className="text-xs text-gray-500">Context-aware assistant</p>
                  </div>
                </div>
                <div className="flex-1 relative">
                  {/* We inject the current course context into ChatArea */}
                  <ChatArea 
                    embeddedContext={`I am currently studying the course "${course.title}" on ${course.platform}. Please act as my expert learning tutor for this specific topic.`} 
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
