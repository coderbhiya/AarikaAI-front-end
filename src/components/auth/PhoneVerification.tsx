import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  getAuth,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
} from "firebase/auth";

export const PhoneVerification: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    // Clear any existing recaptcha when component mounts
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (error) {
        console.error("Error clearing recaptcha:", error);
      }
    }

    return () => {
      // Clear on component unmount
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.error("Error clearing recaptcha:", error);
        }
      }
    };
  }, []);

  // Set up recaptcha verifier
  const setupRecaptcha = () => {
    // Clear any existing recaptcha containers first
    const existingContainer = document.getElementById("recaptcha-container");
    if (existingContainer) {
      existingContainer.innerHTML = "";
    }

    // If there's an existing verifier, clear it
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.error("Error clearing existing recaptcha:", error);
      }
    }

    // Create a new recaptcha verifier
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("Recaptcha verified");
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          toast({
            title: "Recaptcha expired",
            description: "Please try again",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleVerifyPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Set up the invisible reCAPTCHA
      setupRecaptcha();

      // Format the phone number if needed
      let formattedPhoneNumber = phoneNumber.trim();
      if (!formattedPhoneNumber.startsWith("+")) {
        formattedPhoneNumber = `+${formattedPhoneNumber}`;
      }

      console.log(
        "Attempting to send verification code to:",
        formattedPhoneNumber
      );

      // Save the phone number to localStorage for the OTP verification
      localStorage.setItem("phoneNumber", formattedPhoneNumber);

      // Send the verification code
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        appVerifier
      );

      // Store the confirmation result for later verification
      window.confirmationResult = confirmationResult;

      toast({
        title: "Code Sent",
        description: "Verification code has been sent to your phone",
      });

      // Navigate to OTP verification page
      navigate("/otp-verification");
    } catch (error: any) {
      console.error("Phone verification error:", error);

      let errorMessage = "Could not send verification code";
      if (error.code === "auth/invalid-phone-number") {
        errorMessage =
          "Please enter a valid phone number with country code (e.g., +1 for US)";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Authentication failed. Please log in again";
        // Redirect to login page
        navigate("/login");
      }

      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Reset the reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (err) {
          console.error("Error clearing recaptcha:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleLater = () => {
    // Navigate to the main app without phone verification
    navigate("/");
    toast({
      title: "Skipped Phone Verification",
      description: "You can verify your phone number later",
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen w-full">
      {/* Left side with background pattern (only visible on desktop) */}
      {!isMobile && (
        <div className="hidden md:flex md:w-[60%] bg-[#1D1E1F] relative flex-col justify-center items-center">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/258f009b-d1a2-4aaa-a138-e0dcb162ac06.png')] bg-no-repeat bg-left opacity-30" />
          <div className="z-10 flex items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f19f25668e181713412371900d6963ffcadf62db?placeholderIfAbsent=true"
              className="w-[50px] h-[50px] mr-3"
              alt="Brain Icon"
            />
            <span className="text-[30px] font-medium text-white font-poppins">
              BrainAI
            </span>
          </div>
        </div>
      )}

      {/* Right side with phone verification content */}
      <div className="w-full md:w-[40%] flex flex-col p-6 md:p-12 bg-[#09090b]">
        {/* Mobile back button - only on mobile */}
        {isMobile && (
          <div className="mb-12">
            <button
              className="p-4 bg-[#1A1B1C] rounded-md"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="text-white h-5 w-5" />
            </button>
          </div>
        )}

        <div className={`flex flex-col ${isMobile ? "h-full" : ""}`}>
          <div className={`${!isMobile ? "mt-24" : "mt-8"} mb-12`}>
            <h1 className="text-[35px] font-medium text-white font-poppins">
              Enter Your Phone
              <br />
              Number
            </h1>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-14 pl-12 bg-[#1A1B1C] border-none text-white rounded-md"
                placeholder={isMobile ? "+00 0000000 000" : "Phone Number"}
              />
            </div>

            {/* Hidden recaptcha container */}
            <div id="recaptcha-container"></div>

            <Button
              className="w-full h-14 bg-[#1A1B1C] hover:bg-[#222324] text-white font-medium rounded-md"
              onClick={handleVerifyPhone}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              ) : (
                "Verification"
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 bg-transparent border-none hover:bg-[#1A1B1C] text-white font-medium rounded-md"
              onClick={handleLater}
              disabled={isLoading}
            >
              Later
            </Button>
          </div>
        </div>

        {/* Footer - only on desktop */}
        {!isMobile && (
          <div className="mt-auto mb-6 text-center">
            <div className="flex justify-center space-x-4 text-xs text-white/50">
              <a href="#" className="hover:text-white/80">
                Terms of use
              </a>
              <span>|</span>
              <a href="#" className="hover:text-white/80">
                Privacy policy
              </a>
            </div>
            <div className="mt-4 flex justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f19f25668e181713412371900d6963ffcadf62db?placeholderIfAbsent=true"
                className="w-[30px] h-[30px] opacity-30"
                alt="Brain Icon Small"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add RecaptchaVerifier to Window interface
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}
