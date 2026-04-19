"use client";


import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import BrainLogo from './BrainLogo';
import { toast } from "@/components/ui/sonner";

interface VerifyPhoneProps {
  onComplete: () => void;
}

const VerifyPhone: React.FC<VerifyPhoneProps> = ({ onComplete }) => {
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState<number>(270); // 4:30 in seconds
  const isMobile = useIsMobile();
  
  // Format the timer as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Reset the timer and simulate sending a new code
  const handleSendAgain = () => {
    setOtp("");
    setTimer(270); // Reset to 4:30
    toast("Verification code sent", {
      description: "A new verification code has been sent to your phone.",
    });
  };
  
  // Handle verification submission
  const handleVerify = () => {
    if (otp.length === 4) {
      toast("Verification successful", {
        description: "Your phone number has been verified successfully.",
      });
      onComplete();
    } else {
      toast("Verification failed", {
        description: "Please enter a valid verification code.",
      });
    }
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <div className="p-4">
          <button className="p-2 rounded-md bg-white/5">
            <ArrowLeft size={24} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h1 className="text-xl font-bold mb-2 text-center tracking-tight">Verify Identity</h1>
            <p className="text-xs text-center text-slate-400 mb-6 uppercase tracking-widest opacity-80">
              Transmission Sent To Device
            </p>
            
            <p className="text-center text-gray-400 mb-6">+00 000000 0000</p>
            
            <div className="flex justify-center space-x-2 mb-2">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-12 border-white/10 bg-white/5 rounded-md text-white text-xl font-bold"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <p className="text-center text-gray-400 mb-6">({formatTime(timer)})</p>

            <div className="space-y-2.5">
              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20"
                onClick={handleVerify}
              >
                Verify Protocol
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 border-white/10 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl"
                onClick={handleSendAgain}
              >
                Resend Packet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Left side with logo and graphic */}
      <div className="w-1/2 relative flex flex-col items-center justify-center p-12 bg-gradient-to-br from-background to-black">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            {/* Network pattern SVG */}
            <g fill="none" stroke="white" strokeWidth="1">
              <circle cx="150" cy="150" r="5" />
              <circle cx="350" cy="150" r="5" />
              <circle cx="550" cy="150" r="5" />
              <circle cx="150" cy="350" r="5" />
              <circle cx="350" cy="350" r="5" />
              <circle cx="550" cy="350" r="5" />
              <circle cx="150" cy="550" r="5" />
              <circle cx="350" cy="550" r="5" />
              <circle cx="550" cy="550" r="5" />
              
              <line x1="150" y1="150" x2="350" y2="150" />
              <line x1="350" y1="150" x2="550" y2="150" />
              <line x1="150" y1="150" x2="150" y2="350" />
              <line x1="150" y1="350" x2="150" y2="550" />
              <line x1="350" y1="150" x2="350" y2="350" />
              <line x1="350" y1="350" x2="350" y2="550" />
              <line x1="550" y1="150" x2="550" y2="350" />
              <line x1="550" y1="350" x2="550" y2="550" />
              <line x1="150" y1="350" x2="350" y2="350" />
              <line x1="350" y1="350" x2="550" y2="350" />
              <line x1="150" y1="550" x2="350" y2="550" />
              <line x1="350" y1="550" x2="550" y2="550" />
              
              <line x1="150" y1="150" x2="350" y2="350" />
              <line x1="350" y1="150" x2="550" y2="350" />
              <line x1="150" y1="350" x2="350" y2="550" />
              <line x1="350" y1="350" x2="550" y2="550" />
            </g>
          </svg>
        </div>
        
        <div className="flex items-center justify-center z-10 mb-6">
          <BrainLogo size={64} className="mr-4" />
          <h1 className="text-4xl font-bold">BrainAI</h1>
        </div>
      </div>
      
      {/* Right side with verification form */}
      <div className="w-1/2 flex flex-col items-center justify-center p-12 bg-slate-900 relative">
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        <div className="max-w-md w-full relative z-10">
          <h1 className="text-3xl font-bold mb-10 tracking-tight text-white">Verify Identity</h1>
          
          <div className="mb-10">
            <InputOTP maxLength={4} value={otp} onChange={setOtp}>
              <InputOTPGroup className="gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-16 h-16 border-white/10 bg-white/5 rounded-xl text-white text-2xl font-bold shadow-inner"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <div className="space-y-4">
            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-primary/20"
              onClick={handleVerify}
            >
              Confirm Synchronization
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-14 border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[11px] rounded-xl"
              onClick={handleSendAgain}
            >
              Resend Package
            </Button>
          </div>
          
          <div className="mt-12 text-center text-sm text-gray-500 flex items-center justify-center space-x-3">
            <a href="#" className="hover:text-white">Terms of use</a>
            <span>|</span>
            <a href="#" className="hover:text-white">Privacy policy</a>
          </div>
          
          <div className="mt-4 flex justify-center">
            <BrainLogo size={24} className="opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
