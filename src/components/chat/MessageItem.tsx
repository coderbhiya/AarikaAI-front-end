import React, { useState } from "react";
import { Message } from "@/types";
import { Copy, Share, Download, FileText, ImageIcon, File as FileIcon, Globe, ExternalLink, Pencil, Check, X as XIcon } from "lucide-react";
import Markdown from "@/components/common/Markdown";
import { toast } from "sonner";
import BrainLogo from "../BrainLogo";
import JobCard from "./cards/JobCard";
import RoadmapCard from "./cards/RoadmapCard";
import SkillGapCard from "./cards/SkillGapCard";
import ResumeAnalysisCard from "./cards/ResumeAnalysisCard";
import SWOTCard from "./cards/SWOTCard";
import CollegeCard from "./cards/CollegeCard";
import QuizCard from "./cards/QuizCard";
import ResumeSyncCard from "./cards/ResumeSyncCard";
import TimelineCard from "./cards/TimelineCard";
import BadgeCard from "./cards/BadgeCard";
import PdfDownloadCard from "./cards/PdfDownloadCard";
import CourseCard from "./cards/CourseCard";

interface MessageItemProps {
  message: Message;
  onSendMessage?: (text: string) => void;
  onEditMessage?: (messageId: string | number, newText: string) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return <ImageIcon size={16} className="text-emerald-500" />;
  if (fileType === "application/pdf") return <FileText size={16} className="text-red-500" />;
  if (fileType.includes("word")) return <FileText size={16} className="text-blue-500" />;
  return <FileIcon size={16} className="text-gray-400" />;
};

const MessageItem: React.FC<MessageItemProps> = ({ message, onSendMessage, onEditMessage }) => {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);

  const handleSaveEdit = () => {
    if (editText.trim() !== message.message && onEditMessage && message.id) {
      onEditMessage(message.id, editText);
    }
    setIsEditing(false);
  };

  const renderContent = () => {
    const text = message.message;

    if (isUser && isEditing) {
      return (
        <div className="flex flex-col gap-3 w-full">
          <textarea
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onFocus={(e) => {
              const val = e.target.value;
              e.target.value = '';
              e.target.value = val;
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className="w-full bg-[#F0F4F9] text-[#202124] p-4 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 text-[15px] resize-none overflow-hidden transition-all duration-300 min-h-[60px]"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-transparent text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              Save & Submit
            </button>
          </div>
        </div>
      );
    }

    // Quiz Card Logic
    const quizTagRegex = /\[QUIZ_CARD\]([\s\S]*?)\[\/QUIZ_CARD\]/i;
    const quizMatch = text.match(quizTagRegex);

    if (quizMatch) {
      try {
        const quizData = JSON.parse(quizMatch[1]);
        const cleanText = text.replace(quizTagRegex, "").trim();

        return (
          <div className="flex flex-col gap-2 w-full">
            {cleanText && <Markdown text={cleanText} />}
            <QuizCard
              options={quizData.options}
              onSelect={(option) => onSendMessage?.(option)}
            />
          </div>
        );
      } catch (err) {
        console.error("Failed to parse quiz card data", err);
      }
    }

    // Helper function to extract JSON from tags
    const extractJsonData = (tagName: string) => {
      const regex = new RegExp(`\\[${tagName}\\]([\\s\\S]*?)(?:\\[\\/${tagName}\\]|$)`, "i");
      const match = text.match(regex);
      if (match) {
        try {
          let rawData = match[1].trim();
          rawData = rawData.replace(/```json|```/g, "").trim();
          
          const firstBrace = rawData.indexOf("{");
          const lastBrace = rawData.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1) {
            rawData = rawData.substring(firstBrace, lastBrace + 1);
          }

          // Attempt direct parse first
          let data: any;
          try {
            data = JSON.parse(rawData);
          } catch {
            // LLM JSON repair: fix trailing commas, unterminated strings, missing brackets
            let repaired = rawData
              .replace(/,\s*([}\]])/g, "$1")         // trailing commas
              .replace(/(["'])\s*\n/g, "$1,\n")       // missing commas between lines
              .replace(/\\n/g, " ");                  // literal \n inside strings
            
            // If string is unterminated, try closing it
            const openQuotes = (repaired.match(/"/g) || []).length;
            if (openQuotes % 2 !== 0) {
              repaired += '"';
            }
            // Ensure matching braces
            const openBraces = (repaired.match(/{/g) || []).length;
            const closeBraces = (repaired.match(/}/g) || []).length;
            for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}";

            data = JSON.parse(repaired);
          }

          const cleanText = text.replace(regex, "").trim();
          return { data, cleanText };
        } catch (err) {
          console.warn(`[MessageItem] Failed to parse ${tagName} JSON, falling back to markdown`);
          return null;
        }
      }
      return null;
    };

    // Dynamic Card Parsing
    const jobData = extractJsonData("JOB_CARD");
    if (jobData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {jobData.cleanText && <Markdown text={jobData.cleanText} />}
          <JobCard {...jobData.data} />
        </div>
      );
    }

    const roadmapData = extractJsonData("ROADMAP_CARD");
    if (roadmapData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-3xl">
          {roadmapData.cleanText && <Markdown text={roadmapData.cleanText} />}
          <RoadmapCard title={roadmapData.data.title} steps={roadmapData.data.steps} />
        </div>
      );
    }

    const courseData = extractJsonData("COURSE_CARD");
    if (courseData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {courseData.cleanText && <Markdown text={courseData.cleanText} />}
          <CourseCard {...courseData.data} />
        </div>
      );
    }

    const skillGapData = extractJsonData("SKILL_GAP_CARD");
    if (skillGapData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {skillGapData.cleanText && <Markdown text={skillGapData.cleanText} />}
          <SkillGapCard {...skillGapData.data} />
        </div>
      );
    }

    const resumeData = extractJsonData("RESUME_CARD");
    if (resumeData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {resumeData.cleanText && <Markdown text={resumeData.cleanText} />}
          <ResumeAnalysisCard {...resumeData.data} />
        </div>
      );
    }

    const resumeSyncData = extractJsonData("RESUME_SYNC_CARD");
    if (resumeSyncData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {resumeSyncData.cleanText && <Markdown text={resumeSyncData.cleanText} />}
          <ResumeSyncCard diff={resumeSyncData.data.diff} snapshot={resumeSyncData.data.snapshot} />
        </div>
      );
    }

    const timelineData = extractJsonData("TIMELINE_CARD");
    if (timelineData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-3xl">
          {timelineData.cleanText && <Markdown text={timelineData.cleanText} />}
          <TimelineCard month={timelineData.data.month} events={timelineData.data.events} />
        </div>
      );
    }

    const badgeData = extractJsonData("BADGE_CARD");
    if (badgeData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {badgeData.cleanText && <Markdown text={badgeData.cleanText} />}
          <BadgeCard type={badgeData.data.type} message={badgeData.data.message} />
        </div>
      );
    }

    const swotData = extractJsonData("SWOT_CARD");
    if (swotData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {swotData.cleanText && <Markdown text={swotData.cleanText} />}
          <SWOTCard data={swotData.data} />
        </div>
      );
    }

    const pdfDownloadData = extractJsonData("PDF_DOWNLOAD");
    if (pdfDownloadData) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-2xl">
          {pdfDownloadData.cleanText && <Markdown text={pdfDownloadData.cleanText} />}
          <PdfDownloadCard url={pdfDownloadData.data.url} fileName={pdfDownloadData.data.fileName} />
        </div>
      );
    }

    // Handle College/University Cards with typo resilience (Closing tag is optional)
    const collegeTagRegex = /\[(COLLEGE|COLUMN|UNIVERSITY)_CARD\]([\s\S]*?)(?:\[\/(COLLEGE|COLUMN|UNIVERSITY)_CARD\]|$)/i;
    const collegeMatch = text.match(collegeTagRegex);

    if (collegeMatch) {
      try {
        let rawData = collegeMatch[2].trim();
        rawData = rawData.replace(/```json|```/g, "").trim();
        
        // Isolate only the JSON part: from first [ to last ]
        const firstBracket = rawData.indexOf("[");
        const lastBracket = rawData.lastIndexOf("]");
        if (firstBracket !== -1 && lastBracket !== -1) {
          rawData = rawData.substring(firstBracket, lastBracket + 1);
        } else if (rawData.startsWith("{")) {
            // If it's a single object or list of objects without brackets, find last }
            const lastBrace = rawData.lastIndexOf("}");
            if (lastBrace !== -1) rawData = rawData.substring(0, lastBrace + 1);
        }

        let colleges;
        try {
          colleges = JSON.parse(rawData);
        } catch (e) {
          console.warn("[MessageItem] JSON parse failed, attempting repair...");
          try {
            if (rawData.startsWith("{") && !rawData.startsWith("[")) {
              colleges = JSON.parse(`[${rawData}]`);
            } else {
              throw e;
            }
          } catch (e2) {
            console.error("[MessageItem] JSON repair failed:", e2);
            throw e2;
          }
        }

        if (!Array.isArray(colleges)) colleges = [colleges];

        const cleanText = text.replace(collegeTagRegex, "").trim();
        return (
          <div className="flex flex-col gap-2 w-full max-w-2xl">
            {cleanText && <Markdown text={cleanText} />}
            <CollegeCard colleges={colleges} />
          </div>
        );
      } catch (err) {
        console.error("Failed to parse college card data", err);
        return <Markdown text={text} />;
      }
    }

    return <Markdown text={text} />;
  };

  return (
    <div
      className={`group animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out mb-10 last:mb-0`}
    >
      <div className={`flex flex-col gap-1 sm:gap-2 w-full`}>
        {/* Avatar Section for AI */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 px-1 sm:px-0">
             <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
               <BrainLogo size={14} />
             </div>
             <span className="font-semibold text-[14px] text-gray-800">AarikaAI</span>
          </div>
        )}

        {/* Content Section */}
        <div className={`w-full flex flex-col min-w-0 ${isUser && !isEditing ? "items-end" : "items-start"}`}>
          <div className={`${isUser && !isEditing ? "message-bubble-user" : (!isUser ? "message-bubble-ai w-full px-1 sm:px-0" : "w-full")}`}>
            {renderContent()}
          </div>

          {/* Citations Section */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="flex flex-col gap-2 mt-3 px-1 w-full max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 select-none">
                <Globe size={11} className="text-gray-400" />
                Sources & Citations
              </p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((cite: any, index: number) => {
                  let hostname = "";
                  try {
                    hostname = new URL(cite.url).hostname;
                  } catch (e) {
                    hostname = cite.source || "Web Search";
                  }
                  return (
                    <a
                      key={index}
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-primary/5 text-gray-700 hover:text-primary border border-gray-100 hover:border-primary/20 shadow-sm transition-all duration-300 active:scale-95 group/cite max-w-full"
                    >
                      <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 group-hover/cite:bg-primary/10 group-hover/cite:text-primary transition-colors shrink-0">
                        {index + 1}
                      </span>
                      <span className="truncate max-w-[140px] shrink-0">{cite.title}</span>
                      <span className="text-[10px] text-gray-400 font-normal group-hover/cite:text-primary/60 truncate min-w-[30px]">({hostname})</span>
                      <ExternalLink size={10} className="text-gray-300 group-hover/cite:text-primary transition-colors shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* File Attachments */}
          {message.FileAttachments && message.FileAttachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-4 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
              {message.FileAttachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 transition-all duration-300 cursor-pointer group/file"
                  onClick={() => window.open(file.filePath, "_blank")}
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="text-[13px] font-medium truncate text-[#202124]">
                      {file.originalName}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                  <Download size={14} className="text-gray-300 group-hover/file:text-primary transition-colors ml-1" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {isUser ? (
            <div className="flex items-center gap-2 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
               {!isEditing && message.id !== "streaming" && (
                  <button
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      setEditText(message.message);
                      setIsEditing(true);
                    }}
                    title="Edit message"
                  >
                    <Pencil size={14} />
                  </button>
               )}
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-4 px-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(message.message);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy size={16} />
              </button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <Share size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
