"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { featureForPath, trackEvent } from "@/lib/productEvents";

/** Sends one page_view per navigation to a known feature page, for signed-in users only. */
export default function PageTracker() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !pathname || last.current === pathname) return;
    last.current = pathname;
    const feature = featureForPath(pathname);
    if (feature) trackEvent("page_view", { feature });
  }, [pathname, isAuthenticated]);

  return null;
}
