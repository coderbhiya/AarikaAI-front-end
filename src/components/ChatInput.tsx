import React, { useState } from "react";
import { Mic, Send, Image } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFocus?: () => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFocus = () => {},
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const handleImageClick = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  if (isMobile) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center glass-button rounded-full px-3 py-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={handleFocus}
            placeholder={isLoading ? "AI is thinking..." : "Ask me anything..."}
            className="flex-1 bg-transparent border-none focus:outline-none text-white px-2 py-1 text-sm"
            disabled={isLoading}
          />
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-white transition-colors"
            onClick={handleImageClick}
            aria-label="Attach image"
            disabled={isLoading}
          >
            <Image size={18} />
          </button>
          <button
            type="submit"
            className={`p-2 rounded-full ${
              isLoading ? "bg-white/5 cursor-not-allowed" : "bg-white/10"
            } text-white`}
            disabled={!message.trim() || isLoading}
            aria-label="Send message"
          >
            <Send
              size={18}
              className={
                message.trim() && !isLoading ? "text-white" : "text-gray-400"
              }
            />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto">
      <div className="flex items-center glass-button rounded-full px-4 py-2">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Voice input"
          disabled={isLoading}
        >
          <Mic size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={handleFocus}
          placeholder={isLoading ? "AI is thinking..." : "Type message..."}
          className="flex-1 bg-transparent border-none focus:outline-none text-white px-4 py-2"
          disabled={isLoading}
        />
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-white transition-colors"
          onClick={handleImageClick}
          aria-label="Attach image"
          disabled={isLoading}
        >
          <Image size={20} />
        </button>
        <button
          type="submit"
          className="p-2 text-gray-400 hover:text-white transition-colors"
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
        >
          <Send
            size={20}
            className={message.trim() && !isLoading ? "text-white" : ""}
          />
        </button>
      </div>
      {isLoading && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-gray-400">
          AI is responding...
        </div>
      )}
    </form>
  );
};

export default ChatInput;
/* if i need to use then classes will remove and hooks are used*/