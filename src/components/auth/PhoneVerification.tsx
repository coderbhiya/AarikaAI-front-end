"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  Lock,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  Activity,
  Cpu
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";

export const PhoneVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useRouter();
  const { toast } = useToast();
  const auth = getAuth();
  const { user } = useAuth();

  useEffect(() => {
    // Cleanup on mount to ensure a fresh state
    const cleanup = () => {
      if (window.recaptchaVerifier) {
        try {
          // Only clear if the underlying widget has been rendered
          if (typeof window.recaptchaVerifier.clear === "function") {
            window.recaptchaVerifier.clear();
          }
          window.recaptchaVerifier = null;
        } catch (error) {
          console.warn("Silent error during recaptcha cleanup:", error);
        }
      }
      
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";
    };

    cleanup();
    return cleanup;
  }, []);

  const setupRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier) {
        console.log("[DEBUG] Creating new RecaptchaVerifier...");
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: (response: any) => {
            console.log("[DEBUG] Recaptcha verified automatically");
          },
          "expired-callback": () => {
            console.log("[DEBUG] Recaptcha expired, resetting...");
            if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        });
      }
    } catch (error) {
      console.error("[DEBUG] Failed to setup reCAPTCHA:", error);
      throw error;
    }
  };

  const handleUpdatePhone = async () => {
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`;
      setPhoneNumber(formattedPhone);
    }

    if (!formattedPhone || formattedPhone.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid phone number with country code.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      navigate.push("/");
      toast({
        title: "Authentication Required",
        description: "Please sign in first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("[DEBUG] Step 1: Attempting to update backend profile...");
      
      // Update backend first to ensure user has access to initiate this
      await axiosInstance.post("/profile/phone", {
        phone: formattedPhone,
      });
      console.log("[DEBUG] Step 1: Backend updated successfully.");

      // Prepare Recaptcha
      console.log("[DEBUG] Step 2: Initializing reCAPTCHA...");
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      // Import signInWithPhoneNumber dynamically to ensure browser-only execution
      const { signInWithPhoneNumber } = await import("firebase/auth");
      
      console.log("[DEBUG] Step 3: Sending OTP via Firebase...");
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      console.log("[DEBUG] Step 3: Firebase OTP sent successfully.");

      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your mobile device.",
      });

      // Save for OTP verification screen
      if (typeof window !== "undefined") {
        localStorage.setItem("phoneNumber", formattedPhone);
      }

      // Navigate to OTP screen
      console.log("[DEBUG] Final: Navigating to OTP screen...");
      navigate.push("/otp-verification");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      
      const errorCode = error.code || (error.response?.data?.code);
      const serverMessage = error.response?.data?.message || error.message || "Could not link phone number. Please try again.";
      
      toast({
        title: `Failed to Send OTP ${errorCode ? `(${errorCode})` : ""}`,
        description: serverMessage,
        variant: "destructive",
      });
      
      // Reset reCAPTCHA on failure
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden selection:bg-primary/20">
      {/* Visual Side (Desktop) */}
      {!isMobile && (
        <div className="hidden lg:flex lg:w-1/2 bg-[#f8faff] relative overflow-hidden items-center justify-center border-r border-slate-100 p-12">
          <div className="absolute top-[-15%] right-[-15%] w-[80%] h-[80%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/5 blur-[100px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 p-12 max-w-xl animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/10 bg-white shadow-sm">
              <Sparkles size={11} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Security Hub</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Secure <br />
              your <span className="text-primary italic">Account.</span>
            </h1>
            <p className="text-gray-500 font-medium text-[13px] leading-relaxed mb-10 max-w-sm">
              Protect your career data with professional-grade security. Link your phone number to enable two-factor authentication.
            </p>

            <div className="space-y-3">
              {[
                { icon: <ShieldCheck size={16} />, title: "Account Safety", desc: "Multi-factor authentication shield", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: <Globe size={16} />, title: "Global Access", desc: "Access your profile from anywhere", color: "text-emerald-600", bg: "bg-emerald-50" }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={`shrink-0 w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center ${feature.color} shadow-inner group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                    {feature.icon}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-slate-900 font-bold text-[12px] tracking-tight mb-0.5">{feature.title}</h3>
                    <p className="text-gray-500 text-[11px] font-medium leading-tight">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 relative overflow-y-auto scrollbar-none">
        <div className="w-full max-w-[380px] pt-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
          <button
            onClick={() => navigate.back()}
            className="inline-flex items-center gap-2.5 text-slate-400 hover:text-slate-900 transition-all duration-500 mb-4 group"
          >
            <div className="p-2 bg-white border border-slate-100 rounded-lg group-hover:-translate-x-1 transition-transform shadow-sm">
              <ArrowLeft size={13} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Back</span>
          </button>

          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm">
              <Phone size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-[#202124] font-bold text-xl tracking-tight leading-tight">Verification</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-80">Security Protocol</span>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#202124] mb-1 tracking-tight">Enter Number.</h2>
            <p className="text-gray-500 text-[14px] font-medium">Link your mobile for account safety.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Mobile Number</label>
              <div className="relative group">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                <input
                  type="tel"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div id="recaptcha-container" className="rounded-xl overflow-hidden"></div>

            <button
              onClick={handleUpdatePhone}
              disabled={isLoading}
              className="w-full h-11 mt-2.5 rounded-lg bg-[#202124] text-white text-sm font-bold hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-50 shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Code</span>
                  <CheckCircle2 size={14} />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <div className="flex gap-3">
              <Lock size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                We'll send a one-time verification code to this number. Standard messaging rates may apply.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pb-6 text-center opacity-40">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Secure AES-256 Encryption • Aarika.AI Cloud</p>
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

export default PhoneVerification;
