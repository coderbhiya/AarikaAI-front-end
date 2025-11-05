import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Apple, Github } from "lucide-react";
import { Logo } from "@/components/logo/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
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
      login(result.user);

      // Example of using axios to verify token with your backend
      try {
        const response = await axiosInstance.post("/auth/google", {
          idToken: token,
          userData: result.user,
        });

        console.log("API verification response:", response.data);

        // Process successful verification
        if (response.data.success) {
          // Store any returned user data or tokens
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
      login(result.user);

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
    <div className="flex flex-col md:flex-row h-full min-h-screen w-full">
      {/* Left side with background pattern (only visible on desktop) */}
      {!isMobile && (
        <div className="hidden md:block md:w-[60%] bg-[#1D1E1F] relative">
          <div className="absolute inset-0 bg-[url('https://cdn.prod.website-files.com/611e00fae5d1f200eb41e4e9/66b3be5a4f47d87bdc945227_image1-min.png')] bg-no-repeat bg-left opacity-10" />
        </div>
      )}

      {/* Right side with login content */}
      <div className="w-full md:w-[40%] flex flex-col justify-between items-center py-16 px-6 bg-[#09090b]">
        {/* Mobile view has centered logo and welcome text */}
        {isMobile ? (
          <>
            <div className="flex-grow flex flex-col justify-center items-center mt-10">
              <Logo className="mb-8" />
              <h1 className="text-[35px] font-medium text-white mt-6 mb-8 font-poppins text-center">Welcome to CareerAI</h1>
            </div>
            <div className="w-full max-w-md">
              <p className="text-white/70 text-center mb-6">Your story is unique — your career path should be too. CareerAI helps you find what truly fits you.</p>
              <div className="flex flex-col space-y-4 w-full">
                <Button variant="outline" className="h-12 rounded-full border-white/10 bg-transparent hover:bg-white/5" onClick={handleGoogleSignIn} disabled={isLoading.google}>
                  {isLoading.google ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <img src="https://cdn-icons-png.flaticon.com/512/2875/2875331.png" className="w-6 h-6 mr-2" alt="Google Icon" />}
                  <span className="text-white">Google</span>
                </Button>
                {/* <Button variant="outline" className="h-12 rounded-full border-white/10 bg-transparent hover:bg-white/5" onClick={handleAppleSignIn} disabled={isLoading.apple}>
                  {isLoading.apple ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <Apple className="w-5 h-5 text-white mr-2" />}
                  <span className="text-white">Apple</span>
                </Button> */}
              </div>
            </div>
          </>
        ) : (
          // Desktop view has horizontal logo and login on the right
          <>
            <div className="w-full flex justify-center">
              <div className="flex items-center">
                <img src="/favicon.ico" className="w-[50px] h-[50px] mr-3" alt="Brain Icon" />
                <span className="text-[30px] font-medium text-white font-poppins">CareerAI</span>
              </div>
            </div>

            <div className="w-full max-w-md">
              <h2 className="text-[35px] font-medium text-white mt-6 mb-5 font-poppins text-center">Welcome to CareerAI</h2>
              <p className="text-white/70 text-center mb-6">Your story is unique — your career path should be too. CareerAI helps you find what truly fits you.</p>
              <div className="flex flex-col space-y-4 w-full">
                <Button variant="outline" className="h-12 rounded-full border-white/10 bg-transparent hover:bg-white/5" onClick={handleGoogleSignIn} disabled={isLoading.google}>
                  {isLoading.google ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <img src="https://cdn-icons-png.flaticon.com/512/2875/2875331.png" className="w-6 h-6 mr-2" alt="Google Icon" />}
                  <span className="text-white">Google</span>
                </Button>
                {/* <Button variant="outline" className="h-12 rounded-full border-white/10 bg-transparent hover:bg-white/5" onClick={handleAppleSignIn} disabled={isLoading.apple}>
                  {isLoading.apple ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <Apple className="w-5 h-5 text-white mr-2" />}
                  <span className="text-white">Apple</span>
                </Button> */}
              </div>
            </div>
          </>
        )}

        {/* Footer for both views */}
        <div className="mt-16 text-center">
          <div className="flex justify-center space-x-4 text-xs text-white/50">
            <a href="/terms" className="hover:text-white/80">
              Terms of use
            </a>
            <span>|</span>
            <a href="/privacy" className="hover:text-white/80">
              Privacy policy
            </a>
          </div>
          {!isMobile && (
            <div className="mt-4 flex justify-center">
              <img src="/favicon.ico" className="w-[30px] h-[30px] opacity-30" alt="Brain Icon Small" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
