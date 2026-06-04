"use client";

import { useEffect, useState } from "react";
import ChatArea from "../components/ChatArea";
import { useAuth } from "@/contexts/AuthContext";
import { LinkedInShareModal } from "@/components/auth/LinkedInShareModal";

const Index = () => {
  const { user, updateUser } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Show modal if user hasn't shared on LinkedIn yet AND their account was created recently
    if (user && user.hasSharedOnLinkedIn === false) {
      const isNewUser = user.createdAt ? new Date(user.createdAt).getTime() > Date.now() - 5 * 60 * 1000 : false;
      const isRecentSignup = localStorage.getItem("isNewSignup") === "true";
      
      if (isNewUser || isRecentSignup) {
        setShowShareModal(true);
        localStorage.removeItem("isNewSignup"); // Clear flag so it doesn't show again
      }
    }
  }, [user]);

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
