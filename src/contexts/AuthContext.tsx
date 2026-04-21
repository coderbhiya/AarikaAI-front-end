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
  login: (user: any, token?: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  toggleSidebar: () => void;
  showSidebar: boolean;
  updateUser: (updatedUser: User) => void;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load existing data from localStorage to avoid losing profile enrichment
        const savedUserStr = localStorage.getItem("user");
        const existingData = savedUserStr ? JSON.parse(savedUserStr) : { uid: firebaseUser.uid };

        const transformedUser: User = {
          ...existingData,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || existingData.displayName || existingData.name,
          photoURL: firebaseUser.photoURL || existingData.photoURL,
        };

        setUser(transformedUser);
        localStorage.setItem("user", JSON.stringify(transformedUser));

        // Sync with backend to get latest profile data
        syncProfile();
      } else {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const syncProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

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
        };
        updateUser(enrichedUser);
      }
    } catch (err) {
      console.error("Profile synchronization failed:", err);
    }
  };

  const login = (userData: any, authToken?: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (authToken) {
      setToken(authToken);
      localStorage.setItem("authToken", authToken);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const [token, setToken] = useState<string | null>(null);

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
    login,
    logout,
    isAuthenticated: !!user && !!token,
    showSidebar,
    toggleSidebar,
    updateUser,
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
