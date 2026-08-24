/**
 * Auth cookie helpers.
 *
 * The Next.js middleware (src/middleware.ts) gates routes using the `authToken`
 * COOKIE, while the client (AuthContext / axios) uses `authToken` in
 * localStorage. If those two stores ever disagree — most commonly when the
 * cookie silently expires but localStorage persists — the app falls into an
 * infinite redirect loop:  / (login) -> /chat -> / -> /chat ...
 *
 * These helpers keep the cookie a faithful mirror of localStorage and are
 * called on every app load (AuthContext mount) and before any auth-based
 * redirect, so the middleware and the client can never diverge.
 */

// 30 days. Refreshed on every app load so an active user's cookie never
// expires out from under their (non-expiring) localStorage token.
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const isSecure =
  typeof window !== "undefined" && window.location.protocol === "https:";

export const setAuthCookie = (token: string) => {
  if (typeof document === "undefined" || !token) return;
  const secure = isSecure ? "; Secure" : "";
  document.cookie = `authToken=${token}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
};

export const clearAuthCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie =
    "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
};

/**
 * Reconcile the auth cookie with localStorage. Returns the current token
 * (or null). Safe to call anywhere on the client; no-op on the server.
 *
 * - localStorage has a token  -> (re)write the cookie with a fresh max-age
 * - localStorage has no token  -> ensure the cookie is cleared
 */
export const syncAuthCookieFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("authToken");
  if (token) {
    setAuthCookie(token);
    return token;
  }
  clearAuthCookie();
  return null;
};
