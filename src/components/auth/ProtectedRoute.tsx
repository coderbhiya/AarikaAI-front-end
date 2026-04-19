"use client";

import { usePathname } from "next/navigation";
import { Navigate } from "@/components/Navigate";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "../Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading, user, showSidebar } = useAuth();
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

  // if user is authenticated and user mobile number is not complete then redirect to profile page
  /*
  if (isAuthenticated && !user?.phone && pathname !== "/phone-verification") {
    if (pathname === "/") {
      return null;
    }
    return <Navigate to="/phone-verification" replace />;
  }
  */

  // If route doesn't require authentication and user is authenticated
  if (!requireAuth && isAuthenticated) {
    // Redirect to home/dashboard
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-foreground relative">
      <Sidebar />
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${
        !isMobile && showSidebar ? "ml-0" : ""
      }`}>
        {children}
      </main>
    </div>
  );
};
