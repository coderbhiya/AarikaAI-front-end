import React, { useState, useRef, useEffect } from "react";
import { Paperclip, X, Globe, Shield, ArrowRight, Mic, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[], webSearch?: boolean) => void;
  onFocus?: () => void;
  isLoading?: boolean;
  fileInputShow?: boolean;
  disablePaste?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFocus = () => { },
  isLoading = false,
  fileInputShow = true,
  disablePaste = false,
}) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [webSearchActive, setWebSearchActive] = useState(false);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      onSendMessage(message, selectedFiles, webSearchActive);
      setMessage("");
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disablePaste) {
      e.preventDefault();
      toast.warning("Strategic Intel: Manual input is required for this assessment to ensure accuracy.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-2 text-[13px] text-[#444746] font-medium animate-in zoom-in-95 duration-200"
            >
              <Paperclip size={14} className="mr-2 text-primary opacity-70" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2.5 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                disabled={isLoading}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Container */}
      <div className={`relative transition-all duration-500 overflow-hidden ${isLoading ? "opacity-70 pointer-events-none" : "opacity-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"} rounded-[28px]`}>
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col w-full bg-[#F0F4F9] border-none rounded-[28px] group transition-all duration-300"
        >
          <div className="flex flex-col w-full px-4 pt-3 pb-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={onFocus}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isLoading ? "Generating strategy..." : "Ask Aarika anything..."}
              className="w-full bg-transparent text-[#202124] focus:outline-none resize-none text-[15px] md:text-[16px] placeholder-[#444746]/60 font-normal min-h-[44px] max-h-[200px] scrollbar-none leading-relaxed"
              rows={1}
              disabled={isLoading}
            />

            {/* Bottom Utilities Row */}
            <div className="flex items-center justify-between border-t border-gray-200/30 mt-2 pt-2">
              <div className="flex items-center gap-2">
                {fileInputShow && (
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="p-2 rounded-full text-[#444746] hover:bg-white transition-colors shrink-0 flex items-center justify-center border border-transparent active:scale-95"
                    disabled={isLoading}
                    title="Upload resume or files"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                )}

                {/* Web Search Toggle Pill */}
                <button
                  type="button"
                  onClick={() => setWebSearchActive(!webSearchActive)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
                    webSearchActive
                      ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                      : "bg-transparent border-gray-300/60 text-[#444746] hover:bg-white"
                  }`}
                  disabled={isLoading}
                  title="Search the web for real-time information"
                >
                  <Globe size={13} strokeWidth={2.5} className={webSearchActive ? "animate-pulse" : ""} />
                  <span>Search Web</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${webSearchActive ? "bg-primary" : "bg-gray-400"}`} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {!message.trim() && !selectedFiles.length && !isMobile && (
                  <button
                    type="button"
                    className="p-2 rounded-full text-[#444746] hover:bg-white transition-colors flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <Mic size={18} strokeWidth={2} />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!(message.trim() || selectedFiles.length > 0) || isLoading}
                  className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                    (message.trim() || selectedFiles.length > 0) && !isLoading
                      ? "bg-primary text-white shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
                      : "text-gray-300 pointer-events-none bg-transparent"
                  }`}
                >
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-3 text-center">
        <p className="text-[11px] text-[#444746]/60 font-normal tracking-tight">
          AarikaAI may display inaccurate info, so double-check its responses. <span className="underline cursor-pointer">Your privacy & AarikaAI Apps</span>
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
