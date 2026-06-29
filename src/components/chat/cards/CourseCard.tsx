import React, { useState } from "react";
import { BookOpen, ExternalLink, PlayCircle, Plus, Check } from "lucide-react";
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
    <div className="flex flex-col p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all group w-full max-w-xl my-2">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-12 h-12 rounded-[10px] object-cover" />
          ) : (
            <div className={`p-2.5 rounded-[10px] flex items-center justify-center ${isYouTube ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
              {isYouTube ? <PlayCircle size={24} /> : <BookOpen size={24} />}
            </div>
          )}
          <div>
            <h3 className="font-bold text-[#202124] text-[15px] leading-snug line-clamp-2">{title}</h3>
            <p className="text-gray-500 text-[13px] mt-1">{author || platform}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {isFree ? 'FREE' : 'PAID'}
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
            {language}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-2 pt-3 border-t border-gray-50">
        <button
          onClick={handleSave}
          disabled={isSaved || isSaving}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
            isSaved 
              ? 'bg-green-50 text-green-600 border border-green-200' 
              : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
          }`}
        >
          {isSaving ? (
            <span className="animate-pulse">Saving...</span>
          ) : isSaved ? (
            <>
              <Check size={16} /> Added To Learning
            </>
          ) : (
            <>
              <Plus size={16} /> Add To Learning
            </>
          )}
        </button>
        {isSaved && courseId ? (
          <a
            href={`/learning/${courseId}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-[13px] font-bold transition-all shadow-sm"
          >
            <PlayCircle size={16} /> Start Learning
          </a>
        ) : url && url.length > 5 ? (
          <a
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13px] font-bold transition-all"
          >
            <ExternalLink size={16} /> View Original
          </a>
        ) : null}
      </div>
    </div>
  );
}
