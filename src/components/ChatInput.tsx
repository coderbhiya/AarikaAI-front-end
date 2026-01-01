import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Paperclip, X, Sparkles, Globe, Brain } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  onFocus?: () => void;
  isLoading?: boolean;
  fileInputShow?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFocus = () => { },
  isLoading = false,
  fileInputShow = true,
}) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((message.trim() || selectedFiles.length > 0) && !isLoading) {
      onSendMessage(message, selectedFiles);
      setMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-white/[0.05] border border-white/[0.1] backdrop-blur-md rounded-xl px-3 py-2 text-sm text-gray-200 group"
            >
              <Paperclip size={14} className="mr-2 text-primary" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`relative group transition-all duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>

        <form
          onSubmit={handleSubmit}
          className="relative bg-[#121212] border border-white/[0.08] rounded-[1.5rem] shadow-2xl overflow-hidden group-focus-within:border-primary/50 transition-all duration-300"
        >
          <div className="flex flex-col">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={onFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isLoading ? "Thinking..." : "Ask anything about your career..."}
              className="w-full bg-transparent text-gray-100 border-none focus:ring-0 resize-none px-6 pt-5 pb-2 text-lg placeholder-gray-500 leading-relaxed min-h-[60px]"
              rows={1}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {fileInputShow && (
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-2 group/btn"
                    disabled={isLoading}
                  >
                    <Paperclip size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    {!isMobile && <span className="text-sm font-medium">Attach</span>}
                  </button>
                )}

                <button
                  type="button"
                  className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Globe size={18} />
                  {!isMobile && <span className="text-sm font-medium">Search</span>}
                </button>

                <button
                  type="button"
                  className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Brain size={18} />
                  {!isMobile && <span className="text-sm font-medium">Logic</span>}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!(message.trim() || selectedFiles.length > 0) || isLoading}
                  className={`p-3 rounded-full transition-all duration-300 ${(message.trim() || selectedFiles.length > 0) && !isLoading
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-100 hover:scale-105 active:scale-95"
                    : "bg-white/[0.03] text-gray-600 scale-95"
                    }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500 font-medium tracking-wide">
        Elevate your career with precision AI insights.
      </p>
    </div>
  );
};

const ArrowRight = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default ChatInput;
