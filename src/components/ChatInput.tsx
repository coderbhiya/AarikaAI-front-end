import React, { useState, useRef, useEffect } from "react";
import { Paperclip, X, Globe, Shield, ArrowRight, Mic, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
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
      onSendMessage(message, selectedFiles);
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
          <div className="flex items-end px-2 pt-2">
            {fileInputShow && (
              <button
                type="button"
                onClick={handleImageClick}
                className="p-2.5 md:p-3 mb-1 rounded-full text-[#444746] hover:bg-white/50 transition-colors shrink-0"
                disabled={isLoading}
              >
                <Plus size={isMobile ? 20 : 22} strokeWidth={2.5} />
              </button>
            )}

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
              placeholder={isLoading ? "Generating strategy..." : "Enter a prompt here"}
              className="w-full bg-transparent text-[#202124] focus:outline-none resize-none px-2 md:px-4 pt-3 pb-3.5 text-[15px] md:text-[16px] placeholder-[#444746]/60 font-normal min-h-[44px] max-h-[200px] scrollbar-none leading-relaxed"
              rows={1}
              disabled={isLoading}
            />

            <div className="flex items-center gap-1 mb-1 pr-1 md:pr-2">
              {!message.trim() && !selectedFiles.length && !isMobile && (
                <button
                  type="button"
                  className="p-3 rounded-full text-[#444746] hover:bg-white/50 transition-colors"
                  disabled={isLoading}
                >
                  <Mic size={22} strokeWidth={2} />
                </button>
              )}

              <button
                type="submit"
                disabled={!(message.trim() || selectedFiles.length > 0) || isLoading}
                className={`p-2.5 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center ${(message.trim() || selectedFiles.length > 0) && !isLoading
                  ? "text-primary hover:bg-white/50"
                  : "text-gray-300 pointer-events-none"
                  }`}
              >
                <ArrowRight size={isMobile ? 22 : 24} strokeWidth={2.5} />
              </button>
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
