"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ArrowLeft, BookOpen, CheckCircle, ExternalLink, MessageCircle, PlayCircle, Star, Video, Sun, Bookmark, FileText, Award, Calendar, Clock, Tag, Share2, MoreVertical, Download, Menu } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import WorkspaceChatArea from "@/components/learning/WorkspaceChatArea";
import { useAuth } from "@/contexts/AuthContext";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useQuery } from "@tanstack/react-query";
import { getChats } from "@/services/chatService";

export default function LearningWorkspace() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user, toggleSidebar, showSidebar } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "playlist" | "notes" | "transcript" | "resources">("about");
  const [playlistVideos, setPlaylistVideos] = useState<any[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [showTutor, setShowTutor] = useState(true);
  const [savedNotes, setSavedNotes] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<any>(null);

  // Load message logs from thread
  const { data: chatMessages = [] } = useQuery({
    queryKey: ["workspace_chats", courseId],
    queryFn: () => getChats(`course_${courseId}`),
    enabled: !!courseId,
  });

  // Combine default static templates with files shared/uploaded in workspace tutor chat
  const combinedResources = React.useMemo(() => {
    const staticDocs = [
      { id: "static-1", name: "Ultimate Study Cheat Sheet.pdf", size: "1.2 MB", type: "PDF Guide", desc: "Summarized quick-reference sheet covering all critical commands, concepts, and cheat-lists.", url: "" },
      { id: "static-2", name: "Complete Source Code Files.zip", size: "4.8 MB", type: "ZIP Archive", desc: "Fully annotated code files, workspace environments, and configuration templates.", url: "" },
      { id: "static-3", name: "Architecture Reference Diagram.png", size: "850 KB", type: "Image Design", desc: "High-resolution architectural layout showing workflow components and structure.", url: "" },
      { id: "static-4", name: "Additional Reading Guide.md", size: "24 KB", type: "Markdown Doc", desc: "List of recommended publications, articles, and documentation pages.", url: "" }
    ];

    const extracted: any[] = [];
    for (const msg of (chatMessages || [])) {
      if (msg.FileAttachments && msg.FileAttachments.length > 0) {
        for (const att of msg.FileAttachments) {
          if (!extracted.some((r: any) => String(r.id) === String(att.id))) {
            let sizeStr = "Unknown Size";
            if (att.fileSize) {
              if (att.fileSize > 1024 * 1024) {
                sizeStr = `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`;
              } else if (att.fileSize > 1024) {
                sizeStr = `${(att.fileSize / 1024).toFixed(0)} KB`;
              } else {
                sizeStr = `${att.fileSize} B`;
              }
            }
            extracted.push({
              id: att.id,
              name: att.originalName || att.fileName,
              size: sizeStr,
              type: att.fileType || att.mimeType || "File Document",
              desc: att.summary || `File shared in chat by ${msg.role === 'user' ? 'you' : 'AarikaAI'}.`,
              url: att.filePath
            });
          }
        }
      }
    }

    return [...extracted, ...staticDocs];
  }, [chatMessages]);

  // Clean up save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleNotesChange = (val: string) => {
    setSavedNotes(val);
    localStorage.setItem(`notes_${courseId}`, val);
    setSavingStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${apiUrl}/profile/courses/${courseId}/progress`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notes: val })
        });
        if (res.ok) {
          setSavingStatus("saved");
          setTimeout(() => setSavingStatus("idle"), 2000);
        } else {
          setSavingStatus("idle");
        }
      } catch (err) {
        console.error("Error saving notes:", err);
        setSavingStatus("idle");
      }
    }, 1500);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${apiUrl}/profile/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        
        // Find the specific course
        const found = (data.courses || []).find((c: any) => String(c.id) === String(courseId));
        if (found) {
          setCourse(found);
          if (found.notes !== undefined && found.notes !== null) {
            setSavedNotes(found.notes);
          } else {
            const stored = localStorage.getItem(`notes_${courseId}`);
            setSavedNotes(stored || "");
          }
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

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!courseId) return;
      setPlaylistLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${apiUrl}/profile/courses/${courseId}/playlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.videos) {
            setPlaylistVideos(data.videos);
            if (data.videos.length > 0 && !currentVideoId) {
              const mainVideoId = extractYoutubeId(course?.url);
              const hasMainInPlaylist = data.videos.some((v: any) => v.videoId === mainVideoId);
              if (mainVideoId && hasMainInPlaylist) {
                setCurrentVideoId(mainVideoId);
              } else {
                setCurrentVideoId(data.videos[0].videoId);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching playlist:", err);
      } finally {
        setPlaylistLoading(false);
      }
    };
    if (course) {
      fetchPlaylist();
    }
  }, [courseId, course]);

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|playlist\?list=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const handleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!document.fullscreenElement) {
        videoContainerRef.current.requestFullscreen().catch((err) => {
          toast.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const isPlaylist = course?.url?.includes("playlist");
  const youtubeId = extractYoutubeId(course?.url);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFF]">Loading Workspace...</div>;
  if (!course) return null;

  const leftPanelContent = (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFF]">
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Video Player Area */}
        <div ref={videoContainerRef} className="w-full aspect-video rounded-[10px] overflow-hidden shadow-sm bg-black border border-gray-100 relative group">
          {course.platform.toLowerCase().includes("youtube") && youtubeId ? (
            <iframe
              width="100%"
              height="100%"
              src={currentVideoId 
                ? `https://www.youtube.com/embed/${currentVideoId}`
                : (isPlaylist 
                    ? `https://www.youtube.com/embed/videoseries?list=${youtubeId}` 
                    : `https://www.youtube.com/embed/${youtubeId}`)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
              <Video size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-300 font-medium">External Course Content</p>
              <a 
                href={course.url} 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10"
              >
                <ExternalLink size={18} />
                Open in {course.platform}
              </a>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 gap-6 mt-6">
          {(["about", "playlist", "notes", "transcript", "resources"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-black uppercase tracking-wider relative transition-all ${
                activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Cards */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[300px]">
          {activeTab === "about" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{course.title}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" /> Jun 24, 2026
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" /> {course.duration || "2 hours, 15 minutes"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Tag size={14} className="text-blue-500" /> {course.platform} Course
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-blue-50 text-blue-600 border border-blue-100/50">
                  {course.platform}
                </span>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                  {course.language}
                </span>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-purple-50 text-purple-600 border border-purple-100/50">
                  {course.isFree ? "Free" : "Premium"}
                </span>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-orange-50 text-orange-600 border border-orange-100/50">
                  Self-Paced
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8FAFF] border border-blue-50">
                <h3 className="font-bold text-gray-800 text-xs mb-2 uppercase tracking-wider">Course Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {course.description || "This course will guide you through core technical concepts and practical workflows. Leverage the interactive AI Tutor on the right sidebar to ask questions, review concepts, practice quiz questions, or generate notes. Happy learning!"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "playlist" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Course Playlist</h3>
                  <p className="text-[11px] text-gray-400 font-semibold">Select a lesson video to play below.</p>
                </div>
              </div>

              {playlistLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-2" />
                  <span className="text-xs text-gray-400 font-medium animate-pulse">Loading playlist videos...</span>
                </div>
              ) : playlistVideos.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium bg-[#F8FAFF] rounded-2xl border border-dashed border-gray-200">
                  No videos found for this playlist.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
                  {playlistVideos.map((video: any, i: number) => {
                    const isPlaying = video.videoId === (currentVideoId || youtubeId);
                    return (
                      <div
                        key={video.videoId || i}
                        onClick={() => {
                          if (video.videoId) {
                            setCurrentVideoId(video.videoId);
                            toast.success(`Playing lesson ${i + 1}: ${video.title}`);
                          }
                        }}
                        className={`p-3 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                          isPlaying
                            ? "bg-blue-50/70 border-blue-200 shadow-sm"
                            : "bg-white border-gray-100 hover:border-blue-100/50 hover:bg-[#F8FAFF]/50"
                        }`}
                      >
                        <div>
                          <div className="w-full aspect-video rounded-[10px] overflow-hidden bg-slate-900 relative mb-3">
                            {video.thumbnail ? (
                              <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                No Thumbnail
                              </div>
                            )}
                            <div className="absolute bottom-1.5 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-wider">
                              Lesson {i + 1}
                            </div>
                          </div>
                          <h4 className={`text-[12.5px] font-extrabold tracking-tight line-clamp-2 leading-snug mb-2 ${isPlaying ? "text-blue-600 font-black" : "text-slate-800"}`}>
                            {video.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-gray-400 font-semibold line-clamp-2 leading-relaxed">
                          {video.description || "No description available."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full min-h-[300px]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Study Notepad</h3>
                  <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1.5 h-4">
                    {savingStatus === "saving" && (
                      <span className="flex items-center gap-1.5 text-blue-500 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping shrink-0" /> Saving changes to database...
                      </span>
                    )}
                    {savingStatus === "saved" && (
                      <span className="text-emerald-500 font-bold">✓ Saved to cloud database</span>
                    )}
                    {savingStatus === "idle" && (
                      <span>Auto-saved to cloud database</span>
                    )}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    handleNotesChange("");
                    toast.success("Notes cleared!");
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
                >
                  Clear Notepad
                </button>
              </div>
              
              <textarea
                value={savedNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Start typing your study notes here... Summarize key topics, write code blocks, or draft questions."
                className="flex-1 w-full p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium leading-relaxed bg-[#F8FAFF] min-h-[240px] resize-none transition-all"
              />
            </div>
          )}

          {activeTab === "transcript" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Course Timeline & Transcript</h3>
                  <p className="text-[11px] text-gray-400 font-semibold">Click on any section to jump to that timestamp.</p>
                </div>
              </div>

              <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-6 py-2">
                {[
                  { time: "00:00", label: "Introduction & Setup", desc: "Overview of course structure, installation requirements, and configuring your local developer workspace environment." },
                  { time: "02:15", label: "Core Principles & Architecture", desc: "Understanding the underlying system model architecture, client-server lifecycle, and structural data design patterns." },
                  { time: "05:40", label: "Hands-on Implementation", desc: "Writing modular components, implementing service layers, and handling asynchronous execution hooks." },
                  { time: "10:12", label: "Common Pitfalls & Debugging", desc: "Reviewing trace stacks, solving memory retention leaks, and optimizing resource payload constraints." },
                  { time: "14:30", label: "Summary & Practical Wrap-up", desc: "Deploying build artifacts, configuring production servers, and reviewing final takeaways." }
                ].map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => toast.success(`Skipping to timestamp ${item.time}...`)}
                    className="relative group cursor-pointer hover:bg-gray-50/80 p-3.5 rounded-xl border border-transparent hover:border-gray-100 transition-all duration-300 animate-in fade-in duration-200"
                  >
                    <span className="absolute -left-[31px] top-[18px] w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 transition-all" />
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-[12.5px] text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 font-semibold leading-relaxed group-hover:text-gray-600 transition-colors">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Downloadable Resources</h3>
                  <p className="text-[11px] text-gray-400 font-semibold">Supporting guides, source files, and checklists.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {combinedResources.map((res: any, i: number) => (
                  <div 
                    key={res.id || i}
                    className="p-4 rounded-2xl border border-gray-100 hover:border-blue-100/50 hover:bg-[#F8FAFF] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          {res.type}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">{res.size}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-1 mb-1">{res.name}</h4>
                      <p className="text-[11px] text-gray-400 font-semibold leading-relaxed mb-4">{res.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (res.url) {
                          window.open(res.url, "_blank");
                        } else {
                          toast.success(`Downloading ${res.name}...`);
                        }
                      }}
                      className="w-full py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download size={13} /> Download File
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );

  const rightPanelContent = (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-[#F8FAFF] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-600">
            <MessageCircle size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900">Aarika AI Tutor</h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Context-aware assistant</p>
          </div>
        </div>

      </div>
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0">
          <WorkspaceChatArea 
            embeddedContext={`I am currently studying the course "${course.title}" on ${course.platform}. Please act as my expert learning tutor for this specific topic.`} 
            courseId={String(courseId)}
            activeVideoId={currentVideoId || youtubeId || undefined}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFF]">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-[#F0F4FF] rounded-xl transition-all text-gray-600 active:scale-95 duration-200"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>

            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#F0F4FF] rounded-xl transition-all text-gray-600 active:scale-95 duration-200"
              title={showSidebar ? "Close Sidebar" : "Open Sidebar"}
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-extrabold text-gray-900 tracking-tight">{course.title}</h1>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span className="text-blue-600">{course.platform}</span>
                <span>•</span>
                <span>{course.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Course Progress</div>
                <div className="text-xs font-extrabold text-blue-600">{course.progressPercentage}% Complete</div>
              </div>
              <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Tab Actions */}
            <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
              <button 
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'notes' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <FileText size={14} /> Notes
              </button>
              
              <button 
                onClick={() => {
                  setShowTutor(true);
                  router.push(`/learning/${courseId}?msg=Based on this lesson, please prepare a 5-question multiple-choice quiz (MCQ) for me to test my understanding.`);
                  toast.success("AI Quiz triggered! Generating questions...");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <Award size={14} /> Quiz
              </button>
              
              <button 
                onClick={() => {
                  setBookmarked(!bookmarked);
                  toast.success(bookmarked ? "Bookmark removed!" : "Course bookmarked successfully!");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${bookmarked ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Bookmark size={14} className={bookmarked ? "fill-amber-500 stroke-amber-500" : ""} /> Bookmark
              </button>
            </div>

            {/* System theme and profile */}
            <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
              <button 
                onClick={() => toast.info("Light mode is active.")}
                className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all active:scale-95 duration-200"
              >
                <Sun size={18} />
              </button>
              
              <div 
                onClick={() => router.push("/profile")}
                className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold cursor-pointer hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:shadow-lg active:scale-95 animate-in zoom-in duration-300"
                title="Profile"
              >
                {user?.displayName ? user.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        {showTutor ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
            <ResizablePanel defaultSize={70} minSize={40} className="bg-white flex flex-col h-full">
              {leftPanelContent}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={25} className="bg-white flex flex-col h-full border-l border-gray-100">
              {rightPanelContent}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex-1 min-h-0 bg-white flex flex-col h-full">
            {leftPanelContent}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

