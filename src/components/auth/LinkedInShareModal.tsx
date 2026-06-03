"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";
import { Linkedin, Sparkles } from "lucide-react";

interface LinkedInShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (credits: number) => void;
}

export function LinkedInShareModal({ open, onOpenChange, onSuccess }: LinkedInShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShareClick = async () => {
    // 1. Log analytics event
    console.log("[Analytics] linkedin_share_clicked");
    setIsSharing(true);

    // 2. Open LinkedIn Share Dialog in new tab
    const shareUrl = "https://aarikaai.in";
    const shareText = "🚀 I just joined AarikaAI — an AI-powered Career Buddy helping professionals discover opportunities, prepare for interviews, build better resumes, and accelerate career growth.\n\nExplore: https://aarikaai.in\n\n#AarikaAI #CareerGrowth #ArtificialIntelligence #Jobs #CareerDevelopment";
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    
    // We open the window first so it doesn't get blocked by popup blockers
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");

    try {
      // 3. Hit the backend to claim the reward
      const response = await axiosInstance.post("/profile/linkedin-share-reward");
      if (response.data.success) {
        console.log("[Analytics] linkedin_share_completed");
        toast({
          title: "🎉 Thank you for sharing AarikaAI!",
          description: "50 bonus credits have been added to your account.",
        });
        if (onSuccess) {
          onSuccess(response.data.credits);
        }
        // Close modal after a short delay so they can see the success toast
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Failed to claim reward:", error);
      // Even if claiming failed or they already claimed it, we close the modal
      toast({
        title: "Reward Status",
        description: error.response?.data?.message || "Something went wrong while claiming the reward.",
        variant: "default",
      });
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSkip = () => {
    console.log("[Analytics] linkedin_share_skipped");
    onOpenChange(false);
  };

  // Log open event
  React.useEffect(() => {
    if (open) {
      console.log("[Analytics] linkedin_share_popup_opened");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleSkip();
    }}>
      <DialogContent className="sm:max-w-md text-center border-none shadow-2xl bg-gradient-to-b from-card to-background/95 backdrop-blur-xl">
        <DialogHeader className="flex flex-col items-center space-y-4 pt-6">
          <div className="w-16 h-16 rounded-full bg-blue-100/10 flex items-center justify-center ring-8 ring-blue-500/10 mb-2">
            <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            🎉 Welcome to AarikaAI!
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground px-4 leading-relaxed">
            Share your career journey with your professional network and earn <strong className="text-foreground">50 bonus credits</strong> instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col space-y-3 px-6">
          <Button 
            onClick={handleShareClick} 
            disabled={isSharing}
            size="lg"
            className="w-full bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-lg hover:shadow-xl transition-all duration-300 gap-2 h-12 text-base font-semibold"
          >
            {isSharing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Linkedin className="w-5 h-5" />
            )}
            Share on LinkedIn
          </Button>
          <Button 
            onClick={handleSkip}
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground h-12"
          >
            Skip for Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
