"use client";

import { useEffect, useState } from "react";
import ChatArea from "../components/ChatArea";
import { useAuth } from "@/contexts/AuthContext";
import { LinkedInShareModal } from "@/components/auth/LinkedInShareModal";

const Index = () => {
  const { user, updateUser } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Show modal if user hasn't shared on LinkedIn yet
    if (user && user.hasSharedOnLinkedIn === false) {
      setShowShareModal(true);
    }
  }, [user?.hasSharedOnLinkedIn]);

  const handleShareSuccess = (newCredits: number) => {
    if (user) {
      updateUser({ ...user, credits: newCredits, hasSharedOnLinkedIn: true });
    }
  };

  return (
    <>
      <ChatArea />
      <LinkedInShareModal 
        open={showShareModal} 
        onOpenChange={setShowShareModal} 
        onSuccess={handleShareSuccess}
      />
    </>
  );
};

export default Index;
