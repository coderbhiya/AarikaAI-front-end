"use client";

import { useEffect, useState } from "react";
import ChatArea from "../components/ChatArea";
import { useAuth } from "@/contexts/AuthContext";
import { LinkedInShareModal } from "@/components/auth/LinkedInShareModal";
import { getProfileFieldSet } from "@/lib/profileFieldSet";

const Index = () => {
  const { user, updateUser } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const isRecentSignup = localStorage.getItem("isNewSignup") === "true";

    if (isRecentSignup) {
      localStorage.removeItem("isNewSignup"); // Clear flag so it doesn't show again on reload
    }

    // School students are minors (LinkedIn requires 16+), so never prompt them to share.
    if (user && user.hasSharedOnLinkedIn === false && getProfileFieldSet(user) !== "school") {
      const isNewUser = user.createdAt ? new Date(user.createdAt).getTime() > Date.now() - 5 * 60 * 1000 : false;
      if (isNewUser) {
        setShowShareModal(true);
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
