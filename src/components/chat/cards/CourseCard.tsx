import React, { useState } from "react";
import { BookOpen, ExternalLink, PlayCircle, Check, Bookmark } from "lucide-react";
import { toast } from "sonner";

interface CourseCardProps {
  title: string;
  platform: string;
  url: string;
  language: string;
  isFree: boolean;
  author?: string;
  thumbnail?: string;
}

export default function CourseCard({ title, platform, url, language, isFree, author, thumbnail }: CourseCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);

  const isYouTube = (platform || "").toLowerCase().includes("youtube");

  const handleSave = async () => {
    if (isSaved) return;
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';
      const token = localStorage.getItem('authToken');
      
      const res = await fetch(`${apiUrl}/profile/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, platform, url, language, isFree })
      });
      
      if (!res.ok) throw new Error("Failed to save course");
      const data = await res.json();
      
      setIsSaved(true);
      if (data.course && data.course.id) {
        setCourseId(data.course.id);
      }
      toast.success("Course saved to your learning profile!");
    } catch (err) {
      toast.error("Failed to save course.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all group w-full mb-4">
      {/* Thumbnail Section */}
      <div className="relative shrink-0 w-full md:w-[280px] lg:w-[320px] xl:w-[380px] aspect-video rounded-xl overflow-hidden mb-4 md:mb-0">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isYouTube ? 'bg-indigo-950' : 'bg-primary/5'}`}>
            {isYouTube ? (
                <div className="relative w-full h-full bg-[#1e1b4b] flex items-center justify-center">
                   <div className="absolute top-4 left-4 text-white font-bold text-lg leading-tight">
                      Python<br/>Tutorials<br/><span className="text-yellow-400 bg-yellow-400/20 px-1 mt-1 inline-block">IN HINDI</span>
                   </div>
                   <PlayCircle size={48} className="text-white/20 absolute right-4 top-4" />
                </div>
            ) : <BookOpen size={48} className="text-primary/40" />}
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
           8:45:32
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row flex-1 md:ml-5 gap-4">
        {/* Middle Column: Text & Tags */}
        <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
          <div>
            {/* Top Row: Platform, Badges */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 shrink-0">
                {isYouTube ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#FF0000]"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M9.996,15.005l0-6.01l5.204,3.004L9.996,15.005z"/></svg>
                ) : (
                  <BookOpen size={16} className="text-blue-500" />
                )}
                <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-blue-600">
                  {isYouTube ? "YOUTUBE PLAYLIST" : platform}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#dcfce7] text-[#166534]">
                  {isFree ? 'FREE' : 'PAID'}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#e0e7ff] text-[#3730a3] text-[10px] font-bold uppercase tracking-wider">
                  {language}
                </span>
              </div>
            </div>

            {/* Title & Author */}
            <div className="max-w-xl pr-4">
              <h3 className="font-bold text-[#202124] text-[18px] leading-[1.3] mb-1.5">{title}</h3>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600 mb-2.5">
                <span>{author || platform}</span>
                <Check className="w-[14px] h-[14px] text-white bg-blue-500 rounded-full p-[3px]" />
              </div>

              {/* Description Placeholder */}
              <p className="text-[13px] text-[#5f6368] line-clamp-2 mb-4 leading-relaxed">
                Best {title.split(" ")[0] || "programming"} tutorial for absolute beginners in {language}. Learn {title.split(" ")[0] || "programming"} from basics to advanced concepts with practical examples.
              </p>
            </div>
          </div>

          {/* Bottom Row: Tags */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {["Beginner", title.split(" ")[0] || "Course", language, "Full Course"].map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-[#F1F3F4] text-[#5f6368] text-[11px] font-medium rounded-full shrink-0">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Actions (Bookmark & Buttons) */}
        <div className="flex flex-col justify-between items-end shrink-0 w-full md:w-[180px]">
          {/* Top: Bookmark */}
          <button 
            onClick={handleSave} 
            disabled={isSaved || isSaving} 
            className="text-gray-400 hover:text-gray-600 transition-colors mb-4"
            title="Bookmark Course"
          >
            <Bookmark className={`w-[18px] h-[18px] ${isSaved ? "fill-gray-700 text-gray-700" : ""}`} strokeWidth={2} />
          </button>
          
          {/* Center: Stacked Buttons */}
          <div className="flex flex-col gap-2 w-full my-auto">
            <button
              onClick={handleSave}
              disabled={isSaved || isSaving}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] font-semibold transition-all w-full ${
                isSaved 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-[#2563EB] text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : isSaved ? (
                <>
                  <Check size={16} strokeWidth={2} /> Added To Learning
                </>
              ) : (
                <span>+ Add To Learning</span>
              )}
            </button>
            
            {isSaved && courseId ? (
              <a
                href={`/learning/${courseId}`}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-[8px] bg-white border border-gray-200 text-[#3c4043] hover:bg-gray-50 text-[13px] font-semibold transition-all w-full"
              >
                <PlayCircle size={15} strokeWidth={2} /> Start Learning
              </a>
            ) : url ? (
              <a
                href={url.startsWith('http') ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-[8px] bg-white border border-gray-200 text-[#3c4043] hover:bg-gray-50 text-[13px] font-semibold transition-all w-full"
              >
                <ExternalLink size={15} strokeWidth={2} /> View on {isYouTube ? 'YouTube' : platform}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
