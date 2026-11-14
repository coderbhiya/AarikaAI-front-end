"use client";

import React, { useCallback, useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useLinkedIn } from "react-linkedin-login-oauth2";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/auth";

/**
 * Google + LinkedIn buttons. The backend creates the account on first use
 * (/auth/google, /auth/linkedin), so the same buttons sign in and sign up.
 */
export const SocialAuthButtons: React.FC<{ isSignup?: boolean }> = ({ isSignup = false }) => {
  const { toast } = useToast();
  const navigate = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState({ google: false, linkedin: false });

  const onSignedIn = useCallback(
    (user: any, token: string, description: string) => {
      login(user, token);
      if (isSignup) localStorage.setItem("isNewSignup", "true");
      navigate.replace("/chat");
      toast({ title: isSignup ? "Welcome to Aarika.AI" : "Welcome back", description });
    },
    [isSignup, login, navigate, toast]
  );

  const handleGoogle = async () => {
    setLoading((p) => ({ ...p, google: true }));
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const response = await axiosInstance.post("/auth/google", { idToken, userData: result.user });
      if (response.data.success) onSignedIn(response.data.user, response.data.token, `Identified as ${result.user.email}`);
    } catch (error: any) {
      // Clear half-logged-in state in Firebase if backend validation fails
      try {
        await auth.signOut();
      } catch { /* best effort */ }
      toast({
        title: isSignup ? "Sign up failed" : "Login Failed",
        description: error.message || "Backend validation failed or server is unreachable.",
        variant: "destructive",
      });
      console.warn("Google sign in error (Backend might be unreachable):", error.message);
    } finally {
      setLoading((p) => ({ ...p, google: false }));
    }
  };

  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/linkedin` : "http://localhost:3001/linkedin";

  const handleLinkedInSuccess = useCallback(
    async (code: string) => {
      setLoading((p) => ({ ...p, linkedin: true }));
      try {
        const response = await axiosInstance.post("/auth/linkedin", { code, redirectUri });
        if (response.data.success) onSignedIn(response.data.user, response.data.token, "Login successful!");
      } catch (error: any) {
        console.warn("LinkedIn login error (Backend might be unreachable):", error.message);
        toast({ title: "Login Failed", description: "LinkedIn authentication failed", variant: "destructive" });
      } finally {
        setLoading((p) => ({ ...p, linkedin: false }));
      }
    },
    [onSignedIn, redirectUri, toast]
  );

  const handleLinkedInError = useCallback(
    (error: any) => {
      setLoading((p) => ({ ...p, linkedin: false }));
      const errorMessage = error?.errorMessage || error?.message || "LinkedIn popup closed or failed. Please try again.";
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    },
    [toast]
  );

  const { linkedInLogin } = useLinkedIn({
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "",
    redirectUri,
    scope: "openid profile email",
    onSuccess: handleLinkedInSuccess,
    onError: handleLinkedInError,
  });

  const handleLinkedIn = () => {
    if (!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID) {
      toast({ title: "Configuration Error", description: "LinkedIn Client ID is missing in environment", variant: "destructive" });
      return;
    }
    // Don't set loading here: a re-render before the popup opens can block it.
    linkedInLogin();
  };

  const btn =
    "flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] h-11 disabled:opacity-50";

  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={handleGoogle} disabled={loading.google} className={btn}>
        <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5" alt="G" />
        Google
      </button>
      <button type="button" onClick={handleLinkedIn} disabled={loading.linkedin} className={btn}>
        <img
          src="https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg"
          className="w-4 h-4"
          alt="IN"
        />
        LinkedIn
      </button>
    </div>
  );
};

export default SocialAuthButtons;
