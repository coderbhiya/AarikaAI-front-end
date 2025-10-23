import { useState } from "react";
import ChatArea from "../components/ChatArea";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSendMessage = (message: string) => {
    setMessages([...messages, message]);
    // toast("Message sent", {
    //   description: "Your message has been sent successfully.",
    // });
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
  };

  return (
    <>
      <ChatArea onSendMessage={handleSendMessage} onSelectCategory={handleSelectCategory} showWelcome={showWelcome} />
    </>
  );
};

export default Index;

