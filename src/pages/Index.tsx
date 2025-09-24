import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const isMobile = useIsMobile();

  const handleSendMessage = (message: string) => {
    setMessages([...messages, message]);
    toast("Message sent", {
      description: "Your message has been sent successfully.",
    });
  };

  const handleSelectCategory = (category: string) => {
    if (category === "") {
      setShowWelcome(true);
      return;
    }

    toast(`Selected ${category}`, {
      description: `You've selected the ${category} category.`,
    });
    setShowWelcome(false);

    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleNewChat = () => {
    setShowWelcome(true);
    toast("New chat started", {
      description: "You can now select a category for your new chat.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        onNewChat={handleNewChat}
        isOpen={isMobile ? showSidebar : true}
        onClose={toggleSidebar}
      />
      <ChatArea
        onSendMessage={handleSendMessage}
        onSelectCategory={handleSelectCategory}
        showWelcome={showWelcome}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
};

export default Index;
