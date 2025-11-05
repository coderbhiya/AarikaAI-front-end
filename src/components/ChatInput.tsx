import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, FilesIcon, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  onFocus?: () => void;
  isLoading?: boolean;
  fileInputShow?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFocus = () => {},
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
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [message]);

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

  // if (isMobile) {
  //   return (
  //     <div className="w-full">
  //       {/* File Preview */}
  //       {selectedFiles.length > 0 && (
  //         <div className="mb-2 flex flex-wrap gap-2">
  //           {selectedFiles.map((file, index) => (
  //             <div
  //               key={index}
  //               className="flex items-center bg-white/10 rounded-lg px-2 py-1 text-xs"
  //             >
  //               <span className="text-white truncate max-w-20">
  //                 {file.name}
  //               </span>
  //               <button
  //                 type="button"
  //                 onClick={() => removeFile(index)}
  //                 className="ml-1 text-gray-400 hover:text-white"
  //               >
  //                 <X size={12} />
  //               </button>
  //             </div>
  //           ))}
  //         </div>
  //       )}

  //       <form onSubmit={handleSubmit} className="w-full">
  //         <div className="flex items-center glass-button rounded-full px-3 py-2">
  //           <textarea
  //             ref={inputRef}
  //             value={message}
  //             onChange={(e) => setMessage(e.target.value)}
  //             onFocus={handleFocus}
  //             onKeyDown={(e) => {
  //               if (e.key === "Enter" && !e.shiftKey) {
  //                 e.preventDefault();
  //                 handleSubmit(e);
  //               }
  //             }}
  //             placeholder={
  //               isLoading ? "AI is thinking...🤔" : "Type your message..."
  //             }
  //             className="flex-1 bg-transparent border-none focus:outline-none text-white px-4 py-2 resize-none overflow-hidden leading-relaxed"
  //             rows={1}
  //             disabled={isLoading}
  //           />

  //           <input
  //             ref={fileInputRef}
  //             type="file"
  //             multiple
  //             accept="image/*,.pdf,.doc,.docx,.txt"
  //             onChange={handleFileSelect}
  //             className="hidden"
  //           />
  //           <button
  //             type="button"
  //             className="p-2 text-gray-400 hover:text-white transition-colors"
  //             onClick={handleImageClick}
  //             aria-label="Attach file"
  //             disabled={isLoading}
  //           >
  //             <FilesIcon size={18} />
  //           </button>
  //           <button
  //             type="submit"
  //             className={`p-2 rounded-full ${
  //               isLoading ? "bg-white/5 cursor-not-allowed" : "bg-white/10"
  //             } text-white`}
  //             disabled={
  //               !(message.trim() || selectedFiles.length > 0) || isLoading
  //             }
  //             aria-label="Send message"
  //           >
  //             <Send
  //               size={18}
  //               className={
  //                 (message.trim() || selectedFiles.length > 0) && !isLoading
  //                   ? "text-white"
  //                   : "text-gray-400"
  //               }
  //             />
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   );
  // }
  if (isMobile) {
    return (
      <div className="w-full px-2">
        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 overflow-x-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-white/10 rounded-lg px-2 py-1 text-xs text-white"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 text-gray-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-end bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={handleFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                isLoading ? "AI is thinking...🤔" : "Type your message..."
              }
              className="flex-1 bg-transparent text-white border-none focus:outline-none resize-none overflow-hidden leading-relaxed px-2 py-1 placeholder-gray-400 text-sm max-h-32"
              rows={1}
              disabled={isLoading}
            />

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
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={handleImageClick}
                aria-label="Attach file"
                disabled={isLoading}
              >
                <FilesIcon size={18} />
              </button>
            )}

            <button
              type="submit"
              className="p-2 text-gray-400 hover:text-white transition-colors"
              disabled={
                !(message.trim() || selectedFiles.length > 0) || isLoading
              }
              aria-label="Send message"
            >
              <Send
                size={18}
                className={
                  (message.trim() || selectedFiles.length > 0) && !isLoading
                    ? "text-white"
                    : "text-gray-400"
                }
              />
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
            <div
              key={index}
              className="flex items-center bg-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-white truncate max-w-32">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-4xl mx-auto"
      >
        {/* <div className="flex items-center glass-button rounded-full px-4 py-2"> */}
        <div className="flex items-end bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 transition-all duration-200 ease-in-out">
          {/* <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Voice input" disabled={isLoading}>
            <Mic size={20} />
          </button> */}
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              isLoading ? "AI is thinking...🤔" : "Type your message..."
            }
            className="flex-1 bg-transparent text-white border-none focus:outline-none resize-none overflow-hidden leading-relaxed px-3 py-2 max-h-40 placeholder-gray-400"
            rows={1}
            disabled={isLoading}
          />

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
              className="p-2 text-gray-400 hover:text-white transition-colors"
              onClick={handleImageClick}
              aria-label="Attach file"
              disabled={isLoading}
            >
              <FilesIcon size={20} />
            </button>
          )}
          <button
            type="submit"
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={
              !(message.trim() || selectedFiles.length > 0) || isLoading
            }
            aria-label="Send message"
          >
            <Send
              size={20}
              className={
                (message.trim() || selectedFiles.length > 0) && !isLoading
                  ? "text-white"
                  : ""
              }
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
/* if i need to use then classes will remove and hooks are used*/
