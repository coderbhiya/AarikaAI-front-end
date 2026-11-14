import axiosInstance from "@/lib/axios";

// Product analytics → backend POST /events (see careerai_be services/productMetrics.js).
// Fire-and-forget: analytics must never break or slow down the app.

export type ProductEvent = "page_view" | "upgrade_prompt_view" | "upgrade_click";

// Route prefix → feature key (longest prefix first). Unlisted routes are not tracked.
const ROUTE_FEATURES: [string, string][] = [
  ["/mock-interview/live", "mock_interview_live"],
  ["/mock-interview", "mock_interview"],
  ["/dashboard/learning", "learning"],
  ["/resume-builder", "resume_builder"],
  ["/exam-simulator", "exam_simulator"],
  ["/career-discovery", "career_discovery"],
  ["/exam-calendar", "exam_calendar"],
  ["/internships", "internships"],
  ["/open-jobs", "open_jobs"],
  ["/notifications", "notifications"],
  ["/subscription", "subscription"],
  ["/skill-score", "skill_score"],
  ["/community", "community"],
  ["/learning", "learning"],
  ["/journey", "journey"],
  ["/profile", "profile"],
  ["/agent", "job_agent"],
  ["/tracker", "tracker"],
  ["/jobs", "jobs"],
  ["/job/", "jobs"],
  ["/tools", "tools"],
  ["/chat", "chat"],
];

export function featureForPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  for (const [prefix, feature] of ROUTE_FEATURES) {
    if (pathname === prefix || pathname.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`)) return feature;
  }
  return null;
}

export function trackEvent(event: ProductEvent, opts: { feature?: string | null; meta?: Record<string, string | number | boolean> } = {}) {
  try {
    if (typeof window === "undefined" || !localStorage.getItem("authToken")) return;
    axiosInstance.post("/events", { event, feature: opts.feature ?? undefined, meta: opts.meta }).catch(() => {});
  } catch {
    /* ignore */
  }
}
