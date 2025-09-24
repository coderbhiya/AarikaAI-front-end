import React, { useState } from "react";
import ChatInput from "./ChatInput";
import BrainLogo from "./BrainLogo";
import ChatCategory from "./ChatCategory";
import {
  Copy,
  Edit,
  ArrowLeft,
  MoreHorizontal,
  Share,
  ArrowRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/sonner";

interface ChatAreaProps {
  onSendMessage: (message: string) => void;
  onSelectCategory: (category: string) => void;
  showWelcome?: boolean;
  toggleSidebar?: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className="rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
        >
          <div className="text-white">
            {message.content.split("\n\n").map((paragraph, idx) => {
              // Check if paragraph starts with a bullet point
              if (paragraph.trim().startsWith("•")) {
                const items = paragraph.split("•").filter(Boolean);
                return (
                  <ul key={idx} className="list-disc pl-6 space-y-4 my-4">
                    {items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-white">
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
                );
              } else {
                return (
                  <p key={idx} className="mb-4">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>
          {message.sender === "ai" && (
            <div className="mt-4 flex items-center justify-between">
              {/* {!isMobile && (
                <button className="px-4 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 transition-colors">
                  Rephrase this in short.
                </button>
              )} */}
              <div className={`flex gap-2 ${isMobile ? "ml-auto" : ""}`}>
                {isMobile && <Share size={20} className="text-gray-400" />}
                <button className="p-2 rounded-md hover:bg-white/5 transition-colors">
                  <Copy size={20} className="text-gray-400" />
                </button>
                {!isMobile && (
                  <button className="p-2 rounded-md hover:bg-white/5 transition-colors">
                    <Edit size={20} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Component for the welcome screen with categories
const WelcomeScreen: React.FC<{
  onSelectCategory: (category: string) => void;
  isMobile: boolean;
  onStartChatWithoutCategory: () => void;
}> = ({ onSelectCategory, isMobile, onStartChatWithoutCategory }) => {
  const categories = ["Healthcare", "Education", "Entertainment", "Others"];

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isMobile ? "h-full" : "h-[80vh]"
      } w-full max-w-md mx-auto`}
    >
      <div className="text-4xl font-bold mb-4 text-center">BrainAI</div>
      <div className="text-xl mb-8 text-center">
        How can I help you my friend? 😊
      </div>

      <div className="w-full space-y-4">
        {categories.map((category) => (
          <ChatCategory
            key={category}
            title={category}
            onClick={() => onSelectCategory(category)}
          />
        ))}
      </div>

      <button
        onClick={onStartChatWithoutCategory}
        className="mt-8 text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        Start chatting without a category <ArrowRight size={16} />
      </button>
    </div>
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({
  onSendMessage,
  onSelectCategory,
  showWelcome: externalShowWelcome,
  toggleSidebar,
}) => {
  const isMobile = useIsMobile();
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use the external showWelcome value when passed as a prop
  const displayWelcome =
    externalShowWelcome !== undefined ? externalShowWelcome : showWelcome;

  const startChatWithoutCategory = () => {
    setShowWelcome(false);
    // Simulate AI response
    setTimeout(() => {
      const newAiMessage = {
        id: Date.now().toString(),
        content: "Hi there! How can I assist you today?",
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages([newAiMessage]);
    }, 500);
  };

  const fetchAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userMessage }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error body
        console.error("API Error Response:", errorText); // Log it
        throw new Error("Failed to get response from API");
      }

      const data = await response.json();
      return (
        data.response || "Sorry, I couldn't process your request at the moment."
      );
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error("Failed to connect to the AI service", {
        description: "Please try again later.",
      });
      return "Sorry, I couldn't connect to the AI service. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (displayWelcome) {
      setShowWelcome(false);
    }

    // Add user message to the chat
    const newUserMessage = {
      id: Date.now().toString(),
      content: text,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    onSendMessage(text);

    // Get AI response from API
    const aiResponseText = await fetchAIResponse(text);

    // Add AI response to the chat
    const newAiMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponseText,
      sender: "ai" as const,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newAiMessage]);
  };

  const handleSelectCategory = async (category: string) => {
    setShowWelcome(false);
    onSelectCategory(category);

    // Create initial message based on category
    const initialMessage = `You selected the ${category} category. How can I help you with ${category.toLowerCase()} today?`;

    const newAiMessage = {
      id: Date.now().toString(),
      content: initialMessage,
      sender: "ai" as const,
      timestamp: new Date(),
    };

    setMessages([newAiMessage]);
  };

  // Handle back button click in mobile view
  const handleBackButtonClick = () => {
    // Toggle welcome screen on back button click
    if (!displayWelcome) {
      onSelectCategory(""); // Clear any selected category
    }
  };

  // Handle more options button click in mobile view
  const handleMoreButtonClick = () => {
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-background">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button
            className="mobile-back-button"
            onClick={handleBackButtonClick}
          >
            <ArrowLeft size={24} />
          </button>
          {!displayWelcome && (
            <div className="flex items-center">
              <BrainLogo className="mr-2" />
              <span className="font-medium">Chat</span>
            </div>
          )}
          <button
            className="mobile-more-button"
            onClick={handleMoreButtonClick}
          >
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Mobile Content */}
        <div className="mobile-content">
          {displayWelcome ? (
            <WelcomeScreen
              onSelectCategory={handleSelectCategory}
              isMobile={true}
              onStartChatWithoutCategory={startChatWithoutCategory}
            />
          ) : (
            <>
              <MessageList messages={messages} />
              {isLoading && (
                <div className="flex justify-center my-4">
                  <div className="text-white animate-pulse">Thinking...</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Footer */}
        <div className="mobile-footer">
          <ChatInput
            onSendMessage={sendMessage}
            onFocus={displayWelcome ? startChatWithoutCategory : undefined}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 p-6 overflow-y-auto">
        {displayWelcome ? (
          <WelcomeScreen
            onSelectCategory={handleSelectCategory}
            isMobile={false}
            onStartChatWithoutCategory={startChatWithoutCategory}
          />
        ) : (
          <>
            <MessageList messages={messages} />
            {isLoading && (
              <div className="flex justify-center my-4">
                <div className="text-white animate-pulse">Thinking...</div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-6 border-t border-white/10">
        <ChatInput
          onSendMessage={sendMessage}
          onFocus={displayWelcome ? startChatWithoutCategory : undefined}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatArea;
