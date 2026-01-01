import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Apple, Github } from "lucide-react";
import { Logo } from "@/components/logo/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/auth";

export const LoginPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [isLoading, setIsLoading] = useState({
    google: false,
    apple: false,
  });

  // If already authenticated, redirect to chat
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/chat", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Google Sign-in handler
  const handleGoogleSignIn = async () => {
    setIsLoading({ ...isLoading, google: true });
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get the user token to send to your backend
      const token = await result.user.getIdToken();

      // Update auth context
      // login(result.user);

      // Example of using axios to verify token with your backend
      try {
        const response = await axiosInstance.post("/auth/google", {
          idToken: token,
          userData: result.user,
        });

        console.log("API verification response:", response.data);

        // Process successful verification
        if (response.data.success) {
          login(response.data.user);
          // Store any returned user data or tokens
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("authToken", response.data.token);
        }
        // Successfully signed in
        toast({
          title: "Success",
          description: `Signed in as ${result.user.email}`,
        });
        // Navigate to main app
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (apiError) {
        console.error("API verification failed:", apiError);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive",
      });
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading({ ...isLoading, google: false });
    }
  };

  // Apple Sign-in handler
  const handleAppleSignIn = async () => {
    setIsLoading({ ...isLoading, apple: true });
    try {
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);

      // Get the user token
      const token = await result.user.getIdToken();

      // Update auth context
      // login(result.user);

      // Verify token with your backend
      try {
        const response = await axiosInstance.post("/auth/verify-token", {
          token,
        });

        if (response.data.success) {
          localStorage.setItem("authToken", response.data.accessToken);
        }
      } catch (apiError) {
        console.error("API verification failed:", apiError);
      }

      // Successfully signed in
      toast({
        title: "Success",
        description: `Signed in as ${result.user.email || "Apple user"}`,
      });

      // Navigate to phone verification page
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      // navigate("/phone-verification");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Apple",
        variant: "destructive",
      });
      console.error("Apple sign in error:", error);
    } finally {
      setIsLoading({ ...isLoading, apple: false });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden selection:bg-primary/30">
      {/* Visual Side (Desktop) */}
      {!isMobile && (
        <div className="hidden lg:flex lg:w-3/5 bg-[#0d0d0d] relative overflow-hidden items-center justify-center border-r border-white/[0.05]">
          {/* Animated Background Elements */}
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse delay-700" />

          <div className="relative z-10 p-20 max-w-2xl">
            <div className="mb-12 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">The Future of Career Growth</span>
            </div>
            <h1 className="text-6xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
              Elevate your <span className="perplexity-gradient-text">Professional Journey</span> with Precision AI.
            </h1>
            <p className="text-gray-400 text-xl leading-relaxed mb-12">
              Join thousands of professionals using AarikaAI to unlock opportunities, refine their skills, and navigate their career path with clarity.
            </p>

            {/* Stats/Social Proof */}
            <div className="grid grid-cols-3 gap-8 border-t border-white/[0.05] pt-12">
              <div>
                <div className="text-white text-2xl font-bold mb-1">50k+</div>
                <div className="text-gray-500 text-sm font-medium">Active Users</div>
              </div>
              <div>
                <div className="text-white text-2xl font-bold mb-1">98%</div>
                <div className="text-gray-500 text-sm font-medium">Match Accuracy</div>
              </div>
              <div>
                <div className="text-white text-2xl font-bold mb-1">24/7</div>
                <div className="text-gray-500 text-sm font-medium">AI Support</div>
              </div>
            </div>
          </div>

          {/* Abstract Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
      )}

      {/* Auth Side */}
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-8 sm:p-12 relative">
        {/* Logo/Header (Mobile & Desktop) */}
        <div className="w-full max-w-sm mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">AarikaAI</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Welcome back</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Please enter your details to access your professional dashboard.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading.google}
            className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-bold transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading.google ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <button
            onClick={() => { }} // handleAppleSignIn if needed
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white font-bold transition-all hover:bg-white/[0.06] active:scale-[0.98]"
          >
            <Apple size={20} className="fill-current" />
            <span>Continue with Apple</span>
          </button>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-gray-500">
              <span className="bg-[#0a0a0a] px-4">Enterprise access</span>
            </div>
          </div>

          <button className="w-full py-4 text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Terms & Privacy Policy
          </button>
        </div>

        {/* Footer info (Mobile only) */}
        {isMobile && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Powered by AarikaAI Alpha</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Sparkles = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

