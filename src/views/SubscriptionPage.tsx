"use client";

import React, { useState } from "react";
import { 
  Check, 
  Zap, 
  Sparkles, 
  Crown, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Flame,
  Menu,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const SubscriptionPage = () => {
  const { toggleSidebar, user } = useAuth();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Basic",
      description: "Essential interview prep for career starters.",
      price: isYearly ? "249" : "299",
      icon: <Zap className="text-gray-400" size={24} />,
      features: [
        "5 AI Mock Interviews per month",
        "Basic HR Interview Practice",
        "Resume Review",
        "Interview Readiness Score",
        "Basic Communication Tips",
        "Limited Job Recommendations",
      ],
      cta: "Get Started",
      current: true,
      popular: false,
    },
    {
      name: "Professional",
      description: "Comprehensive preparation for serious candidates.",
      price: isYearly ? "549" : "699",
      icon: <Sparkles className="text-primary" size={24} />,
      features: [
        "20 AI Mock Interviews per month",
        "HR + Technical Interview Preparation",
        "Real-Time Answer Scoring",
        "Personalized Feedback",
        "Company-Specific Preparation",
        "ATS Resume Optimization",
        "LinkedIn Profile Review",
        "Skill Gap Analysis",
      ],
      cta: "Upgrade to Pro",
      current: false,
      popular: true,
    },
    {
      name: "Elite",
      description: "The ultimate strategy for top-tier roles.",
      price: isYearly ? "1199" : "1499",
      icon: <Crown className="text-amber-500" size={24} />,
      features: [
        "Unlimited AI Mock Interviews",
        "Advanced Interview Simulation",
        "Pressure-Based Practice",
        "Domain-Specific Rounds",
        "Salary Negotiation Prep",
        "FAANG + MNC Strategy",
        "Premium LinkedIn Optimization",
        "Career Switch Planning",
      ],
      cta: "Coming Soon",
      current: false,
      popular: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#F8F9FA] overflow-y-auto scrollbar-none">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-4 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-gray-500 hover:bg-white hover:shadow-sm transition-all active:scale-95"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight text-primary">AarikaAI Premium</h1>
        </div>
        <button 
          onClick={() => navigate.push("/profile")}
          className="w-10 h-10 rounded-full border border-gray-100 shadow-sm overflow-hidden bg-white flex items-center justify-center"
        >
          {user?.photoURL ? <img src={user.photoURL} alt="" /> : <User size={20} className="text-gray-400" />}
        </button>
      </header>

      {/* Hero Section */}
      <div className="pt-12 pb-8 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[10px] font-bold uppercase tracking-wider mb-6">
          <Flame size={12} />
          <span>Exclusive Launch Offer: 20% Off Yearly</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-[#202124] tracking-tight mb-6">
          Invest in Your <span className="gemini-gradient-text text-primary">Career Success</span>
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
          From basic practice to elite-level strategy, choose the plan that bridges the gap between where you are and where you want to be.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-semibold ${!isYearly ? "text-primary" : "text-gray-400"}`}>Monthly</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 rounded-full bg-white border border-gray-200 p-1 relative transition-all duration-300 shadow-inner"
          >
            <div className={`w-5 h-5 rounded-full bg-primary absolute top-1 transition-all duration-300 ${isYearly ? "left-8" : "left-1 shadow-md"}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isYearly ? "text-primary" : "text-gray-400"}`}>Yearly</span>
            <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
              SAVE 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="px-4 md:px-8 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i}
              className={`relative flex flex-col p-8 rounded-[32px] transition-all duration-500 border group ${
                plan.popular 
                  ? "bg-white border-primary/20 shadow-2xl shadow-primary/10 scale-105 z-10" 
                  : "bg-white/50 border-gray-100 hover:bg-white hover:border-primary/10 hover:shadow-xl shadow-sm"
              } ${plan.comingSoon ? "opacity-90" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <Star size={10} fill="white" />
                  Most Popular
                </div>
              )}

              {plan.comingSoon && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-[32px] z-20 flex items-center justify-center pointer-events-none overflow-hidden">
                   <div className="bg-amber-100/90 text-amber-600 font-bold px-6 py-2 rounded-full border border-amber-200 shadow-sm rotate-[-12deg] text-sm uppercase tracking-widest">
                      Coming Soon
                   </div>
                </div>
              )}

              <div className="mb-6 bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                {plan.icon}
              </div>

              <h3 className="text-2xl font-bold text-[#202124] mb-2">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {plan.description}
              </p>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#202124]">₹{plan.price}</span>
                <span className="text-gray-400 text-sm font-medium">/{isYearly ? "yr" : "mo"}</span>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="text-emerald-500" size={12} strokeWidth={3} />
                    </div>
                    <span className="text-gray-600 text-[13px] font-medium leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                disabled={plan.comingSoon || plan.current}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? "bg-primary text-white hover:bg-blue-700 shadow-lg shadow-primary/25 active:scale-[0.98]" 
                    : plan.current
                      ? "bg-gray-100 text-gray-500 cursor-default"
                      : plan.comingSoon
                        ? "bg-gray-50 text-gray-300"
                        : "bg-white border border-gray-200 text-[#202124] hover:border-primary hover:text-primary active:scale-[0.98]"
                }`}
              >
                {plan.cta}
                {!plan.current && !plan.comingSoon && <ArrowRight size={16} />}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-24 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                <ShieldCheck size={24} />
             </div>
             <h4 className="text-sm font-bold text-[#202124] mb-2">Secure Payments</h4>
             <p className="text-xs text-gray-400">Bank-grade encryption for all transactions.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                <Zap size={24} />
             </div>
             <h4 className="text-sm font-bold text-[#202124] mb-2">Instant Activation</h4>
             <p className="text-xs text-gray-400">Upgrade your account features immediately.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                <ArrowRight size={24} />
             </div>
             <h4 className="text-sm font-bold text-[#202124] mb-2">Cancel Anytime</h4>
             <p className="text-xs text-gray-400">No long-term contracts or hidden fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
