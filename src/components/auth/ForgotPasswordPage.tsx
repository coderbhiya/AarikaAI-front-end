"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Mail,
  ArrowLeft,
  Cpu,
  Activity,
  Brain
} from "lucide-react";
import BrainLogo from "@/components/BrainLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

export const ForgotPasswordPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setIsOtpSent(true);
        toast({
          title: "Success",
          description: "If the email exists, a reset code has been sent.",
        });
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send reset code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter both OTP and new password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/reset-password", { email, otp, newPassword });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Password reset successfully! You can now log in.",
        });
        navigate.push("/");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden selection:bg-primary/20">
      {/* Visual Side (Desktop) */}
      {!isMobile && (
        <div className="hidden lg:flex lg:w-1/2 bg-[#f8faff] relative overflow-hidden items-center justify-center border-r border-slate-100">
          <div className="absolute top-[-15%] right-[-15%] w-[80%] h-[80%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/5 blur-[100px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 p-12 max-w-xl animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/10 bg-white shadow-sm">
              <Sparkles size={11} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Account Recovery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Regain <br />
              your <span className="text-primary italic">Access.</span>
            </h1>
            <p className="text-gray-500 font-medium text-[13px] leading-relaxed mb-10 max-w-sm">
              Security is our priority. Follow the steps to securely recover your account and get back to managing your professional journey.
            </p>

            <div className="space-y-3">
              {[
                { title: "Secure Recovery", desc: "Encrypted verification protocols", color: "text-blue-600", bg: "bg-blue-50", icon: <Cpu size={16} /> },
                { title: "Instant Notification", desc: "Real-time reset link delivery", color: "text-purple-600", bg: "bg-purple-50", icon: <Activity size={16} /> },
                { title: "Profile Safety", desc: "Data protection & privacy enforcement", color: "text-emerald-600", bg: "bg-emerald-50", icon: <Brain size={16} /> }
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
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 relative overflow-y-auto scrollbar-none">
        <div className="w-full max-w-[380px] pt-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
          <Link href="/" className="inline-flex items-center gap-2.5 text-slate-400 hover:text-slate-900 transition-all duration-500 mb-6 group">
            <div className="p-2 bg-white border border-slate-100 rounded-lg group-hover:-translate-x-1 transition-transform shadow-sm">
              <ArrowLeft size={13} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#202124]">Back to Sign In</span>
          </Link>

          <div className="flex items-center gap-3.5 mb-6 group cursor-pointer">
            <BrainLogo size={42} className="rounded-lg shadow-md" />
            <div className="flex flex-col">
              <span className="text-[#202124] font-bold text-xl tracking-tight leading-tight">Aarika.AI</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-80">Professional Hub</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#202124] mb-1 tracking-tight">
              {isOtpSent ? "Enter reset code." : "Reset password."}
            </h2>
            <p className="text-gray-500 text-[14px] font-medium leading-relaxed">
              {isOtpSent
                ? `We've sent a 6-digit code to ${email}. Please enter it below with your new password.`
                : "Enter your email address and we'll send you a code to reset your password."
              }
            </p>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-1.5 focus-within:ring-0">
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 rounded-lg bg-[#202124] text-white text-sm font-bold hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-50 shadow-md transition-all duration-300"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5 focus-within:ring-0">
                  <label className="text-[12px] font-bold text-gray-700 ml-1">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11 text-center tracking-widest"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 focus-within:ring-0">
                  <label className="text-[12px] font-bold text-gray-700 ml-1">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 rounded-lg bg-[#202124] text-white text-sm font-bold hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-50 shadow-md transition-all duration-300"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Reset Password"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="w-full h-11 rounded-lg border border-gray-200 bg-white text-[#202124] text-sm font-bold hover:bg-gray-50 transition-all duration-300 mt-2"
              >
                Use a different email
              </button>
            </form>
          )}

          <div className="text-center mt-12">
            <p className="text-[13px] text-gray-400 font-medium tracking-tight">
              Need more help? <a href="mailto:support@aarika.ai" className="text-primary font-bold hover:underline ml-1">Contact Support</a>
            </p>
          </div>
        </div>

        <div className="mt-auto pb-6 text-center opacity-40">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Secure AES-256 Encryption • AarikaAI Cloud</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
