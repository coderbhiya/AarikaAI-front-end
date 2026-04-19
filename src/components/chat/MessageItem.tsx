import React from "react";
import { Message } from "@/types";
import { Copy, Share, Download, FileText, ImageIcon, File as FileIcon } from "lucide-react";
import Markdown from "@/components/common/Markdown";
import { toast } from "sonner";
import BrainLogo from "../BrainLogo";
import JobCard from "./cards/JobCard";
import RoadmapCard from "./cards/RoadmapCard";
import SkillGapCard from "./cards/SkillGapCard";
import ResumeAnalysisCard from "./cards/ResumeAnalysisCard";
import SWOTCard from "./cards/SWOTCard";

interface MessageItemProps {
  message: Message;
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

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === "user";

  const renderContent = () => {
    const text = message.message;

    // Simple tag detection for demonstration
    if (text.includes("[JOB_CARD]")) {
      return (
        <JobCard
          title="Senior Frontend Engineer"
          company="Google"
          location="Remote"
          salary="$180k - $240k"
          matchPercentage={94}
        />
      );
    }
    if (text.includes("[ROADMAP_CARD]")) {
      return (
        <RoadmapCard
          title="Full-Stack Mastery Path"
          steps={[
            { title: "Frontend Fundamentals", duration: "2 Weeks", isCompleted: true },
            { title: "Backend Architecture", duration: "4 Weeks", isCompleted: false },
            { title: "System Design & DevOps", duration: "6 Weeks", isCompleted: false }
          ]}
        />
      );
    }
    if (text.includes("[SKILL_GAP_CARD]")) {
      return (
        <SkillGapCard
          skills={[
            { name: "System Design", priority: "high", isMissing: true },
            { name: "React Query", priority: "medium", isMissing: true },
            { name: "Tailwind CSS", priority: "low", isMissing: false }
          ]}
        />
      );
    }
    if (text.includes("[RESUME_CARD]")) {
      return (
        <ResumeAnalysisCard
          score={86}
          insights={[
            { category: "Impact", points: ["Used strong action verbs", "Quantified 3 key achievements"] },
            { category: "Structure", points: ["Clean hierarchical layout", "ATS readable sections"] }
          ]}
        />
      );
    }
    if (text.includes("[SWOT_CARD]")) {
      return (
        <SWOTCard
          data={{
            strengths: ["Strong React expertise", "Product mindset"],
            weaknesses: ["Limitied AWS experience", "Public speaking"],
            opportunities: ["Transition to Lead role", "Open source impact"],
            threats: ["Crowded job market", "AI role shifts"]
          }}
        />
      );
    }

    return <Markdown text={text} />;
  };

  return (
    <div
      className={`group animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out mb-10 last:mb-0`}
    >
      <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar Section */}
        {!isUser && (
          <div className="shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
              <BrainLogo size={18} />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className={`flex-1 min-w-0 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div className={`${isUser ? "message-bubble-user" : "message-bubble-ai"}`}>
            {renderContent()}
          </div>

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
          {!isUser && (
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
