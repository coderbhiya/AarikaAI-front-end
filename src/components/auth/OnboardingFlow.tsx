import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  Sparkles, 
  User, 
  Briefcase, 
  Search, 
  MoreHorizontal, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap,
  HelpCircle,
  Bell,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [currentStatus, setCurrentStatus] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [weeklyTime, setWeeklyTime] = useState("");
  const [language, setLanguage] = useState("");
  const [city, setCity] = useState("");

  const handleNext = () => {
    if (!currentStatus || !educationLevel || !careerGoal) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    if (!weeklyTime || !language) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Call API endpoint to save the user onboarding data
      const onboardingData = {
        currentStatus,
        educationLevel,
        careerGoal,
        weeklyTime,
        preferredLanguage: language,
        city: city || null,
      };
      console.log("Saving onboarding data:", onboardingData);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profile updated successfully!");
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error("Failed to save profile information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { id: "student", label: "Student", icon: <User className="w-6 h-6 mb-3 text-blue-500" /> },
    { id: "professional", label: "Working Professional", icon: <Briefcase className="w-6 h-6 mb-3 text-emerald-500" /> },
    { id: "job_seeker", label: "Job Seeker", icon: <Search className="w-6 h-6 mb-3 text-amber-500" /> },
    { id: "other", label: "Other", icon: <MoreHorizontal className="w-6 h-6 mb-3 text-slate-500" /> },
  ];

  const userName = user?.name || "User";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col fixed inset-0 z-50">
      
      {/* GLOBAL HEADER */}
      <header className="h-[60px] lg:h-[68px] flex items-center justify-between px-6 lg:px-8 shrink-0 bg-transparent">
        <div className="flex items-center gap-3">
          <Image 
            src="/aarika-logo.png" 
            alt="AarikaAI Logo" 
            width={40}
            height={40}
            priority={true}
            className="object-contain" 
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight leading-none mb-1">AarikaAI</span>
            <span className="text-xs text-slate-500 font-medium">Your AI Career Buddy</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors font-medium text-sm">
            <HelpCircle className="w-5 h-5" />
            Help
          </button>
          
          <button className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-2 rounded-full transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {userInitials}
            </div>
            <span className="hidden md:block text-sm font-bold text-slate-700 dark:text-slate-200">{userName}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:px-6 md:pb-6 md:pt-2 lg:px-8 lg:pb-8 lg:pt-2 overflow-hidden">
        
        {/* LEFT SIDEBAR (Hidden on mobile, visible on md) */}
        <div className="hidden md:flex w-[260px] lg:w-[280px] p-6 lg:p-8 flex-col justify-between shrink-0 bg-white dark:bg-slate-900 rounded-[10px] shadow-sm border border-slate-200/60 dark:border-slate-800/60">
          <div>
            <div className="space-y-8 mt-2">
              {/* Stepper Item 1 */}
              <div className="relative flex items-start gap-4">
                <div className="absolute top-8 left-[11px] bottom-[-24px] w-[2px] bg-blue-600"></div>
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 z-10 shadow-sm shadow-blue-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">Account</h4>
                  <p className="text-xs text-slate-500 font-medium">Completed</p>
                </div>
              </div>

              {/* Stepper Item 2 */}
              <div className="relative flex items-start gap-4">
                <div className="absolute top-8 left-[11px] bottom-[-24px] w-[2px] bg-slate-200 dark:bg-slate-800"></div>
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 z-10 shadow-sm shadow-blue-200">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">Personal Info</h4>
                  <p className="text-xs text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-block mt-1">In Progress</p>
                </div>
              </div>

              {/* Stepper Item 3 */}
              <div className="relative flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 z-10">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 dark:text-slate-500 leading-none mb-1">Preferences</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-[10px] shadow-sm">
            <Sparkles className="w-5 h-5 text-blue-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Why we ask this?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Your information helps our AI mentor provide better recommendations and personalized guidance.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              Your data is safe with us
            </div>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[10px] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative">
            
          <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto">
            
            {/* Form Area */}
            <div className="flex-1 p-6 md:p-10 lg:p-12 flex flex-col">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4">
                  Step {step} of 2
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  {step === 1 ? "Tell us about yourself" : "Just a few more details"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  This helps AarikaAI <span className="text-blue-600 dark:text-blue-400 font-semibold">personalize</span> your career guidance.
                </p>
              </div>

              {step === 1 && (
                <div className="space-y-8 flex-1">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Education Level</Label>
                      <Select value={educationLevel} onValueChange={setEducationLevel}>
                        <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-[10px] px-4">
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[10px]">
                          <SelectItem value="high_school">10th / 12th</SelectItem>
                          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                          <SelectItem value="masters">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Career Goal</Label>
                      <Select value={careerGoal} onValueChange={setCareerGoal}>
                        <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-[10px] px-4">
                          <SelectValue placeholder="Select career goal" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[10px]">
                          <SelectItem value="get_job">Get a Job</SelectItem>
                          <SelectItem value="switch_career">Switch Careers</SelectItem>
                          <SelectItem value="skill_dev">Skill Development</SelectItem>
                          <SelectItem value="promotion">Promotion / Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Current Status</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {statusOptions.map((option) => (
                        <div 
                          key={option.id}
                          onClick={() => setCurrentStatus(option.id)}
                          className={cn(
                            "relative cursor-pointer flex flex-col items-center justify-center p-6 rounded-[10px] border-2 transition-all duration-200",
                            currentStatus === option.id 
                              ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm" 
                              : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/80"
                          )}
                        >
                          {currentStatus === option.id && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                          {option.icon}
                          <span className={cn(
                            "text-sm font-bold text-center",
                            currentStatus === option.id ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                          )}>
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 flex-1">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Weekly Time Commitment</Label>
                      <Select value={weeklyTime} onValueChange={setWeeklyTime}>
                        <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-[10px] px-4">
                          <SelectValue placeholder="How much time?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[10px]">
                          <SelectItem value="less_than_2">Less than 2 hours/week</SelectItem>
                          <SelectItem value="2_to_5">2-5 hours/week</SelectItem>
                          <SelectItem value="5_to_10">5-10 hours/week</SelectItem>
                          <SelectItem value="more_than_10">10+ hours/week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Preferred Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-[10px] px-4">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[10px]">
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="hinglish">Hinglish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Location</Label>
                    <Input 
                      id="city" 
                      placeholder="Enter your city" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-[10px] px-4"
                    />
                  </div>
                </div>
              )}
              
            </div>

            {/* Right Illustration Area */}
            <div className="hidden lg:flex flex-col items-center justify-center w-[35%] bg-slate-50/50 dark:bg-slate-900/30 p-10 border-l border-slate-100 dark:border-slate-800 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10 mix-blend-overlay"></div>
              
              {/* Decorative Elements */}
              <div className="relative z-10 w-full max-w-xs aspect-square mb-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 rounded-full backdrop-blur-3xl"></div>
                <GraduationCap className="w-24 h-24 text-blue-600/80 drop-shadow-xl relative z-20" />
              </div>

              <div className="relative z-10 bg-white dark:bg-slate-800 p-6 rounded-[10px] shadow-xl shadow-blue-900/5 border border-slate-100 dark:border-slate-700 w-full max-w-sm">
                <div className="text-4xl text-blue-200 dark:text-blue-900/50 font-serif absolute top-2 left-4">"</div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed relative z-10 pt-2 px-2">
                  The more you share, the better AarikaAI can guide your career journey.
                </p>
                <div className="text-4xl text-blue-200 dark:text-blue-900/50 font-serif absolute bottom-0 right-4 rotate-180">"</div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 md:px-10 md:py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
            {step === 1 ? (
              <>
                <div className="text-sm font-semibold text-slate-400">Step 1 of 2</div>
                <Button 
                  onClick={handleNext} 
                  className="h-12 px-14 rounded-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="h-12 px-10 rounded-[10px] font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button 
                  onClick={handleFinish} 
                  disabled={loading} 
                  className="h-12 px-14 rounded-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Finish Setup <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </Button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
