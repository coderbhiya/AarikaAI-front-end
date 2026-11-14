"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Hero headline ending that cycles through a few words. The first word is what the
// server renders (SEO, no-JS) and what screen readers hear; the cycling copy is visual only.
export default function RotatingWord({
  words,
  className = "",
  intervalMs = 2600,
}: {
  words: string[];
  className?: string;
  intervalMs?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), intervalMs);
    return () => clearInterval(t);
  }, [reduceMotion, words.length, intervalMs]);

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <motion.span
        layout
        aria-hidden
        transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
        className="relative inline-flex overflow-hidden whitespace-nowrap pb-[0.12em] align-bottom"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[i]}
            className={className}
            initial={{ y: "70%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-70%", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
}
