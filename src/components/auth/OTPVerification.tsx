"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Activity, ShieldCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, PhoneAuthProvider, linkWithCredential } from "firebase/auth";

export const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const isMobile = useIsMobile();
  const navigate = useRouter();
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    // Get the phone number from localStorage
    const savedPhoneNumber = typeof window !== "undefined" ? localStorage.getItem("phoneNumber") : null;
    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber);
    } else {
      // If no phone number is found, redirect back to phone verification
      navigate.push("/phone-verification");
      toast({
        title: "No Phone Number",
        description: "Please enter your phone number first",
        variant: "destructive",
      });
    }

    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      const localUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!localUser) {
        // No user is signed in, redirect to login
        navigate.push("/");
        toast({
          title: "Authentication Required",
          description: "Please sign in first",
          variant: "destructive",
        });
      }
    }
  }, [navigate, toast, auth]);

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 4-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAttempts((prev) => prev + 1);

    try {
      // Verify the OTP code
      if (!window.confirmationResult) {
        throw new Error(
          "No verification session found. Please request a new code"
        );
      }

      console.log("Attempting to verify OTP:", otp);
      const result = await window.confirmationResult.confirm(otp);

      // Link the phone credential with the existing account if needed
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid !== result.user.uid) {
        // Create a phone auth credential
        const phoneCredential = PhoneAuthProvider.credential(
          window.confirmationResult.verificationId,
          otp
        );

        // Link the credential to the current user account
        await linkWithCredential(currentUser, phoneCredential);
      }

      // Success message
      toast({
        title: "Verification Successful",
        description: "Your phone number has been verified",
      });

      // Update local storage user object
      const localUserStr = localStorage.getItem("user");
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        localUser.phone = phoneNumber;
        localStorage.setItem("user", JSON.stringify(localUser));
      }

      // Cleanup
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      window.confirmationResult = null;
      localStorage.removeItem("phoneNumber");

      // Navigate to the main app
      navigate.push("/profile");
    } catch (error: any) {
      console.error("OTP verification error:", error);

      let errorMessage = "Invalid verification code";
      if (error.code === "auth/invalid-verification-code") {
        errorMessage =
          "The code you entered is invalid. Please check and try again.";
      } else if (error.code === "auth/code-expired") {
        errorMessage =
          "The verification code has expired. Please request a new one.";
        navigate.push("/phone-verification");
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Authentication session expired. Please sign in again.";
        navigate.push("/");
      }

      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // If too many attempts, redirect back
      if (attempts >= 3) {
        toast({
          title: "Too Many Attempts",
          description: "Please request a new verification code",
          variant: "destructive",
        });
        setTimeout(() => navigate.push("/phone-verification"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      toast({
        title: "Code Sent",
        description: "A new verification code has been dispatched to your mobile device.",
      });
      setOtp("");
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: "Could not send a new code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden selection:bg-primary/20">
      {!isMobile && (
        <div className="hidden lg:flex lg:w-1/2 bg-[#f8faff] relative overflow-hidden items-center justify-center border-r border-slate-100 p-12">
          <div className="absolute top-[-15%] right-[-15%] w-[80%] h-[80%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/5 blur-[100px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 p-12 max-w-xl animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/10 bg-white shadow-sm">
              <Sparkles size={11} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Identity Check</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Verify <br />
              your <span className="text-primary italic">Identity.</span>
            </h1>
            <p className="text-gray-500 font-medium text-[13px] leading-relaxed mb-10 max-w-sm">
              Ensure your account remains private. One-time codes add an essential layer of security to your professional data.
            </p>

            <div className="space-y-3">
              {[
                { icon: <ShieldCheck size={16} />, title: "Secure Access", desc: "Enterprise-grade authorization", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: <Activity size={16} />, title: "Real-time Monitoring", desc: "Account activity tracking", color: "text-purple-600", bg: "bg-purple-50" }
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

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 relative overflow-y-auto scrollbar-none">
        <div className="w-full max-w-[380px] pt-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
          <button
            onClick={() => navigate.back()}
            className="inline-flex items-center gap-2.5 text-slate-400 hover:text-slate-900 transition-all duration-500 mb-4 group"
          >
            <div className="p-2 bg-white border border-slate-100 rounded-lg group-hover:-translate-x-1 transition-transform shadow-sm">
              <ArrowLeft size={13} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Change Number</span>
          </button>

          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-[#202124] mb-1 tracking-tight">Enter Code.</h1>
            <p className="text-gray-500 text-[14px] font-medium">
              We've sent a code to <span className="text-primary font-bold">{phoneNumber}</span>
            </p>
          </div>

          <div className="flex flex-col items-center space-y-8">
            <div className="flex justify-center w-full">
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={setOtp}
                className="gap-3"
              >
                <InputOTPGroup className="gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-14 h-14 text-xl font-bold border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 4}
                className="w-full h-11 rounded-lg bg-[#202124] text-white text-sm font-bold hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-50 shadow-md transition-all duration-300"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <button
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full h-14 rounded-xl border border-gray-200 bg-white text-gray-500 text-[14px] font-semibold hover:text-[#202124] hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                {isResending ? (
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto" />
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between px-2 opacity-40">
            <div className="flex gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-default">Terms</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-default">Privacy</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aarika.AI Security Core</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
