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
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);

  return null;
}
