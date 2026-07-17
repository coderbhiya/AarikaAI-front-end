"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { User } from "@/types";
import { auth } from "@/lib/auth";
import axiosInstance from "@/lib/axios";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileLoaded: boolean;
  login: (user: any, token?: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  toggleSidebar: () => void;
  showSidebar: boolean;
  updateUser: (updatedUser: User) => void;
  syncProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const [loading, setLoading] = useState(true);
  // profileLoaded becomes true after the first syncProfile() finishes (success or fail).
  // ProtectedRoute waits for this before enforcing the phone-verification redirect,
  // so we don't bounce to /phone-verification while the backend call is still in-flight.
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load existing data from localStorage to avoid losing profile enrichment
        const savedUserStr = localStorage.getItem("user");
        let existingData: any = { uid: firebaseUser.uid };

        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed.uid === firebaseUser.uid || parsed.email === firebaseUser.email) {
              existingData = parsed;
            } else {
              // Different user account detected, clear stale local storage data to prevent state leakage
              localStorage.removeItem("user");
              localStorage.removeItem("authToken");
            }
          } catch (e) {
            console.error("Failed to parse saved user from localStorage:", e);
          }
        }

        const transformedUser: User = {
          ...existingData,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || existingData.displayName || existingData.name,
          photoURL: firebaseUser.photoURL || existingData.photoURL,
        };

        setUser(transformedUser);
        localStorage.setItem("user", JSON.stringify(transformedUser));

        // syncProfile runs in background — don't await so loading=false fires immediately
        // and ProtectedRoute doesn't spin/redirect in a loop while the API call is in-flight
        syncProfile().catch(() => {});
      } else {
        const authToken = localStorage.getItem("authToken");
        if (authToken) {
          // Custom auth user (not firebase). Sync profile in background.
          syncProfile().catch(() => {});
        } else {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
          document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const syncProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) { setProfileLoaded(true); return; }

      const response = await axiosInstance.get('/profile');
      if (response.data.success && response.data.user) {
        const backendUser = response.data.user;
        const enrichedUser: User = {
          uid: backendUser.firebaseUid || backendUser.uid,
          email: backendUser.email,
          displayName: backendUser.name || backendUser.displayName,
          name: backendUser.name,
          photoURL: backendUser.photoURL,
          phone: backendUser.phone,
          role: backendUser.role,
          UserProfile: backendUser.UserProfile || backendUser.userProfile,
          credits: backendUser.credits,
          hasSharedOnLinkedIn: backendUser.hasSharedOnLinkedIn,
          createdAt: backendUser.createdAt,
        };
        updateUser(enrichedUser);
      }
    } catch (err: any) {
      // Use console.warn instead of console.error to prevent Next.js from throwing a full-screen error overlay in dev mode when the backend is simply down.
      console.warn("Profile synchronization failed (Backend might be unreachable):", err.message);
      
      // If token is rejected, or we don't have a cached user (which causes an infinite loop between middleware and ProtectedRoute)
      if (err.response?.status === 401 || err.response?.status === 403 || !localStorage.getItem("user")) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } finally {
      setProfileLoaded(true);
    }
  };

  const login = (userData: any, authToken?: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (authToken) {
      setToken(authToken);
      localStorage.setItem("authToken", authToken);
      document.cookie = `authToken=${authToken}; path=/; max-age=604800`; // 7 days
      // syncProfile runs in the background — don't await it so navigation is instant
      syncProfile().catch(() => {});
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // BUG-02 fix: initialize token synchronously from localStorage so that
  // isAuthenticated is correct on the very first render and protected routes
  // do not flash the login screen before the useEffect runs.
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem("authToken") : null
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

  // Sidebar
  const [showSidebar, setShowSidebar] = useState(false);
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const updateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    profileLoaded,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    showSidebar,
    toggleSidebar,
    updateUser,
    syncProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
