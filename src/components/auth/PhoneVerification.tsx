import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  Lock,
  Zap,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getAuth, RecaptchaVerifier, PhoneAuthProvider, signInWithPhoneNumber } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";

export const PhoneVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth();
  const { user } = useAuth();

  useEffect(() => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (error) {
        console.error("Error clearing recaptcha:", error);
      }
    }

    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.error("Error clearing recaptcha:", error);
        }
      }
    };
  }, []);

  const setupRecaptcha = () => {
    const existingContainer = document.getElementById("recaptcha-container");
    if (existingContainer) {
      existingContainer.innerHTML = "";
    }

    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.error("Error clearing existing recaptcha:", error);
      }
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        console.log("Recaptcha verified");
      },
      "expired-callback": () => {
        toast({
          title: "Session Expired",
          description: "Please refresh the neural link",
          variant: "destructive",
        });
      },
    });
  };

  const handleUpdatePhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10 || !/^[0-9+]+$/.test(phoneNumber)) {
      toast({
        title: "Protocol Violation",
        description: "Invalid coordinate format. Please provide a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.post("/profile/phone", {
        phone: phoneNumber,
      });
      toast({
        title: "Link Established",
        description: "Your communication channel has been synchronized.",
      });

      if (user) {
        user.phone = phoneNumber;
      }
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast({
        title: "Synchronization Failure",
        description: "Could not link channel. System error.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#0a0a0a] overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Left side (Desktop Only) */}
      {!isMobile && (
        <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-20">
          <div className="absolute inset-0 bg-white/[0.02] bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                <ShieldCheck size={36} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Identity Core</h2>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-[2.5rem] p-8 border-white/[0.05] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Neural Protection</h3>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed uppercase tracking-widest text-xs">
                  Your communication channels are encrypted via 2FA protocols, ensuring total entity isolation.
                </p>
              </div>

              <div className="glass-card rounded-[2.5rem] p-8 border-white/[0.05] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Globe size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Global Reach</h3>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed uppercase tracking-widest text-xs">
                  Synchronize your account across global nodes for seamless career intelligence retrieval.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right side with content */}
      <div className="w-full lg:w-2/5 relative z-10 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 bg-black/40 backdrop-blur-3xl border-l border-white/5">
        <div className="w-full max-w-sm flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-700">

          {/* Header */}
          <div className="mb-16">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all active:scale-95 mb-12"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
                <Sparkles size={12} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verification Phase</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Channel<br />Sync
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Initialize communication link</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-white/[0.03] border border-white/[0.08] text-white rounded-2xl font-bold text-lg focus:outline-none focus:border-primary transition-all placeholder:text-white/10"
                  placeholder="+00 (000) 000-0000"
                />
              </div>
            </div>

            <div id="recaptcha-container"></div>

            <button
              onClick={handleUpdatePhone}
              disabled={isLoading}
              className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.3em] text-[12px] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <CheckCircle2 size={18} /> Establish Link
                </>
              )}
            </button>
          </div>

          {/* Legal Footer */}
          <div className="mt-auto pt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              <a href="/terms" className="text-[10px] font-black text-gray-700 hover:text-white uppercase tracking-widest transition-colors">Terms</a>
              <span className="w-1 h-1 rounded-full bg-white/5" />
              <a href="/privacy" className="text-[10px] font-black text-gray-700 hover:text-white uppercase tracking-widest transition-colors">Privacy</a>
            </div>
            <div className="flex items-center gap-2 text-primary opacity-20">
              <div className="w-8 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
            </div>
          </div>
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


