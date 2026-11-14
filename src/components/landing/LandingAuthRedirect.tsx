"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { syncAuthCookieFromStorage } from "@/lib/authCookie";

/**
 * Signed-in visitors never see the landing page: the middleware sends anyone
 * with an authToken cookie from "/" to "/chat". This covers the remaining case
 * of a token in localStorage without the cookie (same as LoginPage does), so
 * the cookie is synced first and the middleware doesn't bounce us back.
 */
export default function LandingAuthRedirect() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      syncAuthCookieFromStorage();
      router.replace("/chat");
    }
  }, [loading, isAuthenticated, router]);

  return null;
}
