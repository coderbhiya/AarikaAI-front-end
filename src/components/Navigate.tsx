"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: any;
}

export function Navigate({ to, replace }: NavigateProps) {
  const router = useRouter();

  useEffect(() => {
    // Fallback: If Next.js router gets stuck, forcefully redirect after 1.5 seconds
    const fallbackTimer = setTimeout(() => {
      if (replace) {
        window.location.replace(to);
      } else {
        window.location.assign(to);
      }
    }, 1500);

    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }

    return () => clearTimeout(fallbackTimer);
  }, [to, replace, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/20 backdrop-blur-sm">
      <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
    </div>
  );
}
