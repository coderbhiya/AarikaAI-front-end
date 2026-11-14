"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navigate } from "@/components/Navigate";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "../Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

import { OnboardingFlow } from "./OnboardingFlow";
import { getProfileFieldSet, ProfileFieldSet } from "@/lib/profileFieldSet";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  /** false = run the auth/onboarding/persona checks but render children without the Sidebar shell
   *  (for pages that draw their own layout, e.g. /tools and /exam-simulator). */
  withLayout?: boolean;
}

// Which personas may open a route. Mirrors the server-side guards in
// careerai_be/src/middleware/personaGuard.js — the server is the real enforcement,
// this just avoids showing a broken page.
const ROUTE_PERSONAS: { prefix: string; allow?: ProfileFieldSet[]; deny?: ProfileFieldSet[] }[] = [
  { prefix: "/jobs", deny: ["school"] },
  { prefix: "/job/", deny: ["school"] },
  { prefix: "/agent", deny: ["school"] },
  { prefix: "/resume-builder", deny: ["school"] },
  { prefix: "/career-discovery", allow: ["school"] },
  { prefix: "/exam-calendar", allow: ["school", "govt_aspirant"] },
  { prefix: "/internships", allow: ["college", "job_seeker", "career_switcher"] },
  { prefix: "/mock-interview", allow: ["college", "job_seeker", "professional", "career_switcher"] },
];

export const isRouteAllowedFor = (pathname: string, fieldSet: ProfileFieldSet) => {
  const rule = ROUTE_PERSONAS.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix.endsWith("/") ? r.prefix : r.prefix + "/"));
  if (!rule) return true;
  if (rule.allow) return rule.allow.includes(fieldSet);
  if (rule.deny) return !rule.deny.includes(fieldSet);
  return true;
};

const NotForYourProfile: React.FC<{ fieldSet: ProfileFieldSet }> = ({ fieldSet }) => (
  <div className="flex flex-1 items-center justify-center p-6">
    <div className="max-w-md w-full rounded-2xl border border-border bg-white p-6 text-center shadow-sm" data-testid="persona-blocked">
      <h2 className="text-lg font-semibold text-foreground">This section isn&apos;t part of your plan</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {fieldSet === "school"
          ? "Job search, auto-apply and resumes are for college students and professionals. Try Career Discovery or your Exam Calendar instead."
          : "This tool is designed for a different profile type. Ask Aarika what fits your goals best."}
      </p>
      <a href="/chat" className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
        Go to chat
      </a>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true, withLayout = true }) => {
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

  const fieldSet = getProfileFieldSet(user);
  const allowed = !user || !pathname || isRouteAllowedFor(pathname, fieldSet);
  const content = allowed ? children : <NotForYourProfile fieldSet={fieldSet} />;

  if (!withLayout) {
    return <>{content}</>;
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#F8F9FA] text-foreground relative">
      <React.Suspense fallback={<div className="w-64 border-r border-border/50 bg-background/95 h-full" />}>
        <Sidebar />
      </React.Suspense>
      <main className={`flex-1 h-full flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-in-out ${!isMobile && showSidebar ? "ml-0" : ""
        }`}>
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-full w-full">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
          </div>
        }>
          {content}
        </React.Suspense>
      </main>
    </div>
  );
};
