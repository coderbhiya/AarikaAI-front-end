import React, { useState, useRef } from "react";
import { Mic, Send, Image, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  onFocus?: () => void;
  isLoading?: boolean;
  fileInputShow?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFocus = () => {}, isLoading = false, fileInputShow = true }) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFiles.length > 0) && !isLoading) {
      onSendMessage(message, selectedFiles);
      setMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isMobile) {
    return (
      <div className="w-full">
        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-white/10 rounded-lg px-2 py-1 text-xs">
                <span className="text-white truncate max-w-20">{file.name}</span>
                <button type="button" onClick={() => removeFile(index)} className="ml-1 text-gray-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-center glass-button rounded-full px-3 py-2">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onFocus={handleFocus} placeholder={isLoading ? "AI is thinking...🤔" : "Ask me anything..."} className="flex-1 bg-transparent border-none focus:outline-none text-white px-2 py-1 text-sm" disabled={isLoading} />

            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />
            <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors" onClick={handleImageClick} aria-label="Attach file" disabled={isLoading}>
              <Image size={18} />
            </button>
            <button type="submit" className={`p-2 rounded-full ${isLoading ? "bg-white/5 cursor-not-allowed" : "bg-white/10"} text-white`} disabled={!(message.trim() || selectedFiles.length > 0) || isLoading} aria-label="Send message">
              <Send size={18} className={(message.trim() || selectedFiles.length > 0) && !isLoading ? "text-white" : "text-gray-400"} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center bg-white/10 rounded-lg px-3 py-2 text-sm">
              <span className="text-white truncate max-w-32">{file.name}</span>
              <button type="button" onClick={() => removeFile(index)} className="ml-2 text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto">
        <div className="flex items-center glass-button rounded-full px-4 py-2">
          <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Voice input" disabled={isLoading}>
            <Mic size={20} />
          </button>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onFocus={handleFocus} placeholder={isLoading ? "AI is thinking...🤔" : "Type message..."} className="flex-1 bg-transparent border-none focus:outline-none text-white px-4 py-2" disabled={isLoading} />
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />
          {fileInputShow && (
            <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors" onClick={handleImageClick} aria-label="Attach file" disabled={isLoading}>
              <Image size={20} />
            </button>
          )}
          <button type="submit" className="p-2 text-gray-400 hover:text-white transition-colors" disabled={!(message.trim() || selectedFiles.length > 0) || isLoading} aria-label="Send message">
            <Send size={20} className={(message.trim() || selectedFiles.length > 0) && !isLoading ? "text-white" : ""} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
/* if i need to use then classes will remove and hooks are used*/
