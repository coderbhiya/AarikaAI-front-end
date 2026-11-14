"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Apple,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Cpu,
  Activity,
  Brain,
  Mail,
  Lock,
  ArrowLeft
} from "lucide-react";
import BrainLogo from "@/components/BrainLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { signInWithEmailAndPassword } from "firebase/auth";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/auth";
import { syncAuthCookieFromStorage } from "@/lib/authCookie";

export const LoginPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useRouter();
  const { login, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState({ email: false });

  // If already authenticated, redirect to chat.
  // Ensure the middleware's auth cookie is in sync with our localStorage token
  // BEFORE navigating, otherwise the middleware would bounce us straight back
  // to "/" and cause an infinite / -> /chat -> / redirect loop.
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      syncAuthCookieFromStorage();
      navigate.replace("/chat");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleEmailSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading({ ...isLoading, email: true });
    try {
      // 1. Try Firebase Email/Password Sign In first
      console.log("Attempting Firebase Email/Password authentication...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Verify the Firebase ID token with our backend
      const response = await axiosInstance.post("/auth/verify-token", {
        idToken: token,
        userData: {
          email: userCredential.user.email,
          name: userCredential.user.displayName || email.split("@")[0],
        }
      });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate.replace("/chat");
        toast({
          title: "Welcome back",
          description: "Login successful!",
        });
      }
    } catch (firebaseError: any) {
      console.warn("Firebase Email/Password auth failed, attempting fallback to backend login...", firebaseError.message);
      
      try {
        // 2. Fallback to custom backend login endpoint
        const response = await axiosInstance.post("/auth/login", { email, password });

        if (response.data.success) {
          const userData = {
            email,
            displayName: email.split("@")[0],
          };
          login(userData, response.data.token);

          navigate.replace("/chat");

          toast({
            title: "Welcome back",
            description: "Login successful!",
          });
        }
      } catch (backendError: any) {
        console.warn("Fallback backend login error:", backendError.message);
        const serverMessage = backendError?.response?.data?.message;
        let message = serverMessage || "Invalid email or password";

        toast({
          title: "Login Failed",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-white overflow-hidden selection:bg-primary/20">
      {/* Visual Side (Desktop) */}
      {!isMobile && (
        <div className="hidden lg:flex lg:w-1/2 bg-[#f8faff] relative overflow-hidden items-center justify-center border-r border-slate-100">
          <div className="absolute top-[-15%] right-[-15%] w-[80%] h-[80%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/5 blur-[100px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 p-12 max-w-xl animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/10 bg-white shadow-sm">
              <Sparkles size={11} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Intelligence Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Accelerate <br />
              your <span className="text-primary italic">Career.</span>
            </h1>
            <p className="text-gray-500 font-medium text-[13px] leading-relaxed mb-10 max-w-sm">
              The premium career optimization platform. Predict growth, analyze gaps, and master your professional trajectory.
            </p>

            <div className="space-y-3">
              {[
                { title: "Precision Matching", desc: "Autonomous career trajectory mapping", color: "text-blue-600", bg: "bg-blue-50", icon: <Cpu size={16} /> },
                { title: "Skill Gap Analysis", desc: "Real-time market requirement delta", color: "text-purple-600", bg: "bg-purple-50", icon: <Activity size={16} /> },
                { title: "Strategic Roadmaps", desc: "Dynamic multi-phase evolution plans", color: "text-emerald-600", bg: "bg-emerald-50", icon: <Brain size={16} /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={`shrink-0 w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.color} shadow-inner group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                    {item.icon}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-slate-900 font-bold text-[12px] tracking-tight mb-0.5">{item.title}</h3>
                    <p className="text-gray-500 text-[11px] font-medium leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Side */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto scrollbar-none">
        <div className="min-h-full w-full flex flex-col items-center justify-between p-8 relative">
          <div className="w-full max-w-[380px] pt-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center gap-3.5 mb-6 group cursor-pointer">
              <BrainLogo size={42} className="rounded-lg shadow-md" />
              <div className="flex flex-col">
                <span className="text-[#202124] font-bold text-xl tracking-tight leading-tight">Aarika.AI</span>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-80">Professional Hub</span>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#202124] mb-1 tracking-tight">Welcome back.</h2>
              <p className="text-gray-500 text-[14px] font-medium">Continue your career journey.</p>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[12px] font-bold text-gray-700">Password</label>
                  <Link href="/forgot-password" title="Forgot Password" className="text-[11px] font-bold text-primary hover:underline">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    type="password"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading.email}
                className="w-full h-11 mt-2.5 rounded-lg bg-[#202124] text-white text-sm font-bold hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-50 shadow-md transition-all duration-300"
              >
                {isLoading.email ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <span className="relative px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-white">Professional Auth</span>
            </div>

            <SocialAuthButtons />

            <div className="text-center mt-10">
              <p className="text-[13px] text-gray-500 font-medium">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline ml-1 transition-all">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="pb-6 text-center opacity-60">
          <p className="text-[10px] font-semibold text-gray-500">
            © 2026{" "}
            <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-700 font-bold">
              SenseforgeAI
            </a>{" "}
            • Aarika.AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
