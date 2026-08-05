"use client";

import { usePathname } from "next/navigation";
import { Navigate } from "@/components/Navigate";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "../Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

import { OnboardingFlow } from "./OnboardingFlow";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading, profileLoaded, user, showSidebar, syncProfile } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/20 backdrop-blur-sm">
        <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated && requireAuth) {
    return <Navigate to="/" replace />;
  }

  // Option A: Trigger 15-second Micro-Onboarding if user hasn't completed onboarding yet
  if (profileLoaded && isAuthenticated && user && user.onboardingCompleted === false) {
    return <OnboardingFlow onComplete={() => syncProfile()} />;
  }

  // If route doesn't require authentication and user is authenticated
  if (!requireAuth && isAuthenticated) {
    // Redirect to home/dashboard
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#F8F9FA] text-foreground relative">
      <Sidebar />
      <main className={`flex-1 h-full flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-in-out ${!isMobile && showSidebar ? "ml-0" : ""
        }`}>
        {children}
      </main>
    </div>
  );
};
