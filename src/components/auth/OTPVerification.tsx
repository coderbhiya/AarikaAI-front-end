import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getAuth, PhoneAuthProvider, linkWithCredential } from "firebase/auth";

export const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    // Get the phone number from localStorage
    const savedPhoneNumber = localStorage.getItem("phoneNumber");
    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber);
    } else {
      // If no phone number is found, redirect back to phone verification
      navigate("/phone-verification");
      toast({
        title: "No Phone Number",
        description: "Please enter your phone number first",
        variant: "destructive",
      });
    }

    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      const localUser = localStorage.getItem("user");
      if (!localUser) {
        // No user is signed in, redirect to login
        navigate("/login");
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

      // Navigate to the main app
      navigate("/");
    } catch (error: any) {
      console.error("OTP verification error:", error);

      let errorMessage = "Invalid verification code";
      if (error.code === "auth/invalid-verification-code") {
        errorMessage =
          "The code you entered is invalid. Please check and try again.";
      } else if (error.code === "auth/code-expired") {
        errorMessage =
          "The verification code has expired. Please request a new one.";
        navigate("/phone-verification");
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Authentication session expired. Please sign in again.";
        navigate("/login");
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
        setTimeout(() => navigate("/phone-verification"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending verification code
  const handleResendCode = async () => {
    setIsResending(true);

    try {
      // Navigate back to phone verification to re-initiate the process
      navigate("/phone-verification");
    } catch (error: any) {
      console.error("Resend code error:", error);
      toast({
        title: "Resend Failed",
        description: error.message || "Could not resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
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

      {/* Right side with OTP verification content */}
      <div className="w-full md:w-[40%] flex flex-col p-6 md:p-12 bg-[#09090b]">
        {/* Mobile back button - only on mobile */}
        {isMobile && (
          <div className="mb-8">
            <button
              className="p-4 bg-[#1A1B1C] rounded-md"
              onClick={() => navigate("/phone-verification")}
            >
              <ArrowLeft className="text-white h-5 w-5" />
            </button>
          </div>
        )}

        <div
          className={`flex flex-col ${isMobile ? "h-full items-center" : ""}`}
        >
          <div
            className={`${!isMobile ? "mt-24" : "mt-8"} mb-8 ${
              isMobile ? "text-center" : ""
            }`}
          >
            <h1 className="text-[35px] font-medium text-white font-poppins">
              Verify Phone Number
            </h1>
            {isMobile && (
              <p className="text-white/70 mt-4">
                We Have Sent Code To Your Phone Number
              </p>
            )}
            {phoneNumber && (
              <p className="text-white mt-6 text-lg">{phoneNumber}</p>
            )}
          </div>

         <div className="space-y-10">
  {/* OTP Input */}
  <div className="flex justify-center">
    <InputOTP maxLength={4} value={otp} onChange={setOtp}>
      <InputOTPGroup className="flex gap-4">
        <InputOTPSlot
          index={0}
          className="w-28 h-14 bg-transparent border border-gray-600 text-center text-xl text-white focus:border-gray-400 focus:outline-none"
        />
        <InputOTPSlot
          index={1}
          className="w-28 h-14 bg-transparent border border-gray-600 rounded text-center text-xl text-white focus:border-gray-400 focus:outline-none"
        />
        <InputOTPSlot
          index={2}
          className="w-28 h-14 bg-transparent border border-gray-600 rounded text-center text-xl text-white focus:border-gray-400 focus:outline-none"
        />
        <InputOTPSlot
          index={3}
          className="w-28 h-14 bg-transparent border border-gray-600 text-center text-xl text-white focus:border-gray-400 focus:outline-none"
        />
      </InputOTPGroup>
    </InputOTP>
  </div>


            

            <Button
              className="w-full h-14 bg-[#1A1B1C] hover:bg-[#222324] text-white font-medium rounded-md"
              onClick={handleVerifyOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              ) : isMobile ? (
                "Verify"
              ) : (
                "Verification"
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 bg-transparent border-white/10 hover:bg-[#1A1B1C] text-white font-medium rounded-md"
              onClick={handleResendCode}
              disabled={isResending}
            >
              {isResending ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              ) : (
                "Send Again"
              )}
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
