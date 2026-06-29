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
  User,
  Loader2,
  Smartphone,
  AlertCircle,
  CreditCard,
  Calendar,
  Lock,
  Building
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import Script from "next/script";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/services/paymentService";

const SubscriptionPage = () => {
  const { toggleSidebar, user } = useAuth();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  // Custom checkout states
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  
  // Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // UPI / Netbanking states
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Custom payment simulator states
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorStage, setSimulatorStage] = useState<"processing" | "bank_otp" | "upi_pending" | "netbanking_login" | "success" | "failure">("processing");
  const [otpCode, setOtpCode] = useState("");
  const [netbankingUserId, setNetbankingUserId] = useState("");
  const [netbankingPassword, setNetbankingPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  // Bug #14 fix: store absolute deadline timestamp instead of only a decrement counter
  // so backgrounded tabs don't cause premature OTP expiry
  const [otpDeadline, setOtpDeadline] = useState<number>(0);
  const [activeOrderId, setActiveOrderId] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);
  const [simulatorError, setSimulatorError] = useState("");

  // Bug #14 fix: Use Date.now()-based deadline to measure remaining seconds.
  // setTimeout is throttled by browsers when tab is backgrounded, so a simple countdown
  // decrement can cause premature OTP expiry. We compute remaining from the actual deadline.
  React.useEffect(() => {
    if (!showSimulator || otpDeadline === 0) return;
    if (simulatorStage !== "bank_otp" && simulatorStage !== "upi_pending") return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((otpDeadline - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        if (simulatorStage === "bank_otp") {
          setSimulatorStage("failure");
          setSimulatorError("OTP expired. Please try again.");
        }
      }
    };

    tick(); // immediate first tick
    const timer = setInterval(tick, 500); // poll at 500ms for accuracy
    return () => clearInterval(timer);
  }, [otpDeadline, showSimulator, simulatorStage]);

  const handleSimulatedSuccess = async (mockPaymentId: string) => {
    try {
      setSimulatorStage("processing");
      console.log("[SubscriptionPage] Custom Simulator succeeded, verifying mock signature on server...");
      
      const verifyResult = await verifyRazorpayPayment({
        razorpay_payment_id: mockPaymentId,
        razorpay_order_id: activeOrderId,
        razorpay_signature: "mock_signature_for_" + mockPaymentId,
      });

      if (verifyResult && verifyResult.success) {
        setSimulatorStage("success");
      } else {
        setSimulatorStage("failure");
        setSimulatorError(verifyResult.message || "Payment verification failed");
      }
    } catch (err: any) {
      console.error("[SubscriptionPage] Mock verification API error:", err);
      setSimulatorStage("failure");
      setSimulatorError(err.response?.data?.message || err.message || "Verification API error");
    } finally {
      setLoadingPlan(null);
    }
  };

  const closeSimulator = () => {
    setShowSimulator(false);
    setOtpCode("");
    setNetbankingUserId("");
    setNetbankingPassword("");
    if (simulatorStage === "success") {
      setCheckoutPlan(null);
      navigate.push("/profile");
    }
  };

  const handleSubscriptionPayment = async (plan: any) => {
    try {
      setLoadingPlan(plan.name);
      setSimulatorError("");

      // Validate fields before proceeding
      if (paymentMethod === "card") {
        if (!cardNumber || cardNumber.replace(/\s/g, "").length < 15) {
          alert("Please enter a valid card number.");
          setLoadingPlan(null);
          return;
        }
        if (!cardName) {
          alert("Please enter the cardholder name.");
          setLoadingPlan(null);
          return;
        }
        if (!cardExpiry || cardExpiry.length < 5) {
          alert("Please enter a valid expiry date (MM/YY).");
          setLoadingPlan(null);
          return;
        }
        if (!cardCvv || cardCvv.length < 3) {
          alert("Please enter a valid CVV.");
          setLoadingPlan(null);
          return;
        }
      } else if (paymentMethod === "upi") {
        if (!upiId || !upiId.includes("@")) {
          alert("Please enter a valid UPI ID (e.g., username@upi).");
          setLoadingPlan(null);
          return;
        }
      }

      // Amount in paise
      let amountPaise = parseInt(plan.price) * 100;
      if (isYearly) {
        amountPaise = amountPaise * 12; // Billed yearly
      }

      // Add 18% GST to match the checkout visual breakup
      amountPaise = Math.round(amountPaise * 1.18);
      setAmountPaid(amountPaise);

      console.log(`[SubscriptionPage] Creating order of amount: ${amountPaise} paise for plan: ${plan.name}`);
      const orderData = await createRazorpayOrder(amountPaise);

      if (!orderData || !orderData.success || !orderData.order_id) {
        throw new Error(orderData.message || "Failed to create order on server");
      }

      // If it is Live Mode, bypass the custom simulator and launch the real Razorpay payment gateway popup
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T6MH1qLeqDkah4";
      const isLiveMode = keyId.startsWith("rzp_live");

      if (isLiveMode) {
        console.log("[SubscriptionPage] Live mode key detected. Launching real Razorpay popup...");
        
        const options: any = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "AarikaAI",
          description: `Upgrade to ${plan.name} (${isYearly ? "Yearly" : "Monthly"})`,
          order_id: orderData.order_id,
          handler: async (response: any) => {
            try {
              setLoadingPlan(plan.name);
              console.log("[SubscriptionPage] Real Payment Succeeded, verifying signature...", response);
              
              const verifyResult = await verifyRazorpayPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResult && verifyResult.success) {
                alert(`🎉 Success! You have upgraded to AarikaAI Premium (${plan.name}).`);
                setCheckoutPlan(null);
                navigate.push("/profile");
              } else {
                alert("❌ Payment verification failed: " + (verifyResult.message || "Unknown error"));
              }
            } catch (verifyErr: any) {
              console.error("[SubscriptionPage] Verification API error:", verifyErr);
              alert("❌ Verification failed. Please check transaction or contact support.");
            } finally {
              setLoadingPlan(null);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#2563EB",
          },
          modal: {
            ondismiss: () => {
              console.log("[SubscriptionPage] Real Payment modal dismissed by user.");
              setLoadingPlan(null);
            }
          }
        };

        if (paymentMethod === "card") {
          options.prefill.method = "card";
        } else if (paymentMethod === "upi" && upiId) {
          options.prefill.method = "upi";
          options.prefill.vpa = upiId;
        } else if (paymentMethod === "netbanking" && selectedBank) {
          options.prefill.method = "netbanking";
          options.prefill.bank = selectedBank;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (resp: any) => {
          console.error("[SubscriptionPage] Real Payment Failed event:", resp.error);
          alert(`❌ Payment failed: ${resp.error.description}`);
          setLoadingPlan(null);
        });
        rzp.open();
        return;
      }

      // Instead of opening Razorpay standard checkout popup, trigger our custom simulator
      setActiveOrderId(orderData.order_id);
      setShowSimulator(true);
      setSimulatorStage("processing");

      // Simulate network request to gateway
      setTimeout(() => {
        if (paymentMethod === "card") {
          setSimulatorStage("bank_otp");
          // Bug #14 fix: set absolute deadline instead of just counter
          setOtpDeadline(Date.now() + 300 * 1000); // 5 minutes
          setCountdown(300);
        } else if (paymentMethod === "upi") {
          setSimulatorStage("upi_pending");
          setOtpDeadline(Date.now() + 180 * 1000); // 3 minutes
          setCountdown(180);
        } else if (paymentMethod === "netbanking") {
          setSimulatorStage("netbanking_login");
        }
      }, 1500);

    } catch (err: any) {
      console.error("[SubscriptionPage] Payment process error:", err);
      alert(`❌ Error starting checkout: ${err.response?.data?.message || err.message}`);
      setLoadingPlan(null);
    }
  };

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

      {/* Checkout Screen or Pricing Grid */}
      {checkoutPlan ? (
        <div className="px-4 md:px-8 pb-24 max-w-6xl mx-auto pt-6 flex-1 flex flex-col justify-start w-full">
          <style dangerouslySetInnerHTML={{__html: `
            .card-perspective { perspective: 1000px; }
            .card-inner { transition: transform 0.6s; transform-style: preserve-3d; }
            .card-flip { transform: rotateY(180deg); }
            .card-face { backface-visibility: hidden; }
            .card-back { transform: rotateY(180deg); }
          `}} />

          {/* Back button */}
          <button 
            onClick={() => setCheckoutPlan(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary font-semibold text-sm mb-6 transition-colors self-start"
          >
            &larr; Back to plans
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            
            {/* Payment Section - Left (7 columns) */}
            <div className="lg:col-span-7 bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500">
              <h3 className="text-xl font-bold text-[#202124] mb-6">Choose Payment Method</h3>
              
              {/* Payment Tabs */}
              <div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-2xl mb-8">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === "card" 
                      ? "bg-white text-primary shadow-sm border border-slate-100" 
                      : "text-gray-500 hover:text-gray-800 hover:bg-white/40"
                  }`}
                >
                  <CreditCard size={14} />
                  Credit / Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === "upi" 
                      ? "bg-white text-primary shadow-sm border border-slate-100" 
                      : "text-gray-500 hover:text-gray-800 hover:bg-white/40"
                  }`}
                >
                  <Smartphone size={14} />
                  UPI (PhonePe/GPay)
                </button>
                <button
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === "netbanking" 
                      ? "bg-white text-primary shadow-sm border border-slate-100" 
                      : "text-gray-500 hover:text-gray-800 hover:bg-white/40"
                  }`}
                >
                  <Building size={14} />
                  Netbanking
                </button>
              </div>

              {/* CARD PAYMENT FORM */}
              {paymentMethod === "card" && (
                <div className="space-y-6">
                  {/* CSS 3D Flipping virtual card preview */}
                  <div className="card-perspective w-full max-w-[340px] h-[200px] mx-auto mb-8">
                    <div className={`card-inner w-full h-full relative ${isCardFlipped ? "card-flip" : ""}`}>
                      
                      {/* Front face (Titanium metal theme) */}
                      <div className="card-face absolute w-full h-full rounded-2xl bg-gradient-to-tr from-[#111827] via-[#1F2937] to-[#111827] border border-white/10 p-6 text-white flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-8 rounded-lg bg-gradient-to-tr from-yellow-600 via-yellow-300 to-yellow-500 shadow-inner flex items-center justify-center relative overflow-hidden border border-yellow-400/20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.15)_40%)]" />
                            <div className="w-6 h-5 rounded border border-black/10 opacity-30" />
                          </div>
                          <span className="text-lg font-black italic tracking-tight text-white/95">AarikaAI</span>
                        </div>
                        <div className="my-4 text-xl font-mono tracking-[0.18em] text-center text-white/90 drop-shadow">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>
                        <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-slate-400">
                          <div>
                            <span className="block text-[8px] text-slate-500 mb-0.5">Card Holder</span>
                            <span className="font-bold text-white tracking-wide">{cardName || "YOUR NAME"}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-500 mb-0.5">Expires</span>
                            <span className="font-bold text-white tracking-wide">{cardExpiry || "MM/YY"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Back face */}
                      <div className="card-face card-back absolute w-full h-full rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] py-6 text-white flex flex-col justify-between shadow-xl">
                        <div className="w-full h-10 bg-black mt-2"></div>
                        <div className="px-6 flex justify-end items-center my-3">
                          <div className="bg-slate-300 text-slate-800 font-mono font-bold px-3 py-1.5 rounded text-sm tracking-widest min-w-[60px] text-right">
                            {cardCvv || "•••"}
                          </div>
                        </div>
                        <div className="px-6 text-[8px] text-slate-400 text-center">
                          Secured mock transaction processor. PCI-DSS compliant keys.
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card input fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                      <div className="relative group">
                        <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                        <input 
                          type="text" 
                          maxLength={19}
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
                            setCardNumber(val);
                          }}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                      <div className="relative group">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                        <input 
                          type="text" 
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date</label>
                        <div className="relative group">
                          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                          <input 
                            type="text" 
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 2) {
                                val = val.substring(0, 2) + "/" + val.substring(2, 4);
                              }
                              setCardExpiry(val);
                            }}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVV</label>
                        <div className="relative group">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                          <input 
                            type="password" 
                            maxLength={3}
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI PAYMENT FORM */}
              {paymentMethod === "upi" && (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3">
                    <Sparkles className="text-primary mt-0.5 shrink-0" size={16} />
                    <p className="text-xs text-primary font-medium leading-relaxed">
                      Enter your UPI ID below. We will request a secure authorization directly to your GPay, PhonePe, or BHIM app.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">UPI ID / VPA</label>
                    <div className="relative group">
                      <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                      <input 
                        type="text" 
                        placeholder="username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.trim())}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NETBANKING SELECTOR */}
              {paymentMethod === "netbanking" && (
                <div className="space-y-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Your Bank</label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { code: "HDFC", name: "HDFC Bank" },
                      { code: "SBIN", name: "SBI" },
                      { code: "ICICI", name: "ICICI Bank" },
                      { code: "UTIB", name: "Axis Bank" },
                      { code: "KKBK", name: "Kotak Bank" },
                      { code: "PUNB", name: "PNB" }
                    ].map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => setSelectedBank(bank.code)}
                        className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all duration-300 ${
                          selectedBank === bank.code 
                            ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/10" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Order Summary - Right (5 columns) */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#202124] mb-6">Order Summary</h3>
                
                {/* Plan detail row */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <h4 className="font-bold text-sm text-[#202124]">{checkoutPlan.name} Plan</h4>
                    <span className="text-[11px] text-gray-400 font-medium">{isYearly ? "Billed Annually" : "Billed Monthly"}</span>
                  </div>
                  <span className="font-bold text-base text-[#202124]">₹{checkoutPlan.price}/mo</span>
                </div>

                {/* Breakup pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Plan Price</span>
                    <span>₹{isYearly ? parseInt(checkoutPlan.price) * 12 : checkoutPlan.price}.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>GST (18%)</span>
                    <span>₹{(isYearly ? parseInt(checkoutPlan.price) * 12 * 0.18 : parseInt(checkoutPlan.price) * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Discount</span>
                    <span className="text-emerald-500">₹0.00</span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-8">
                  <span className="font-bold text-sm text-[#202124]">Total Amount</span>
                  <span className="font-black text-xl text-primary">
                    ₹{(isYearly ? parseInt(checkoutPlan.price) * 12 * 1.18 : parseInt(checkoutPlan.price) * 1.18).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                {/* Pay button */}
                <button
                  disabled={loadingPlan !== null}
                  onClick={() => handleSubscriptionPayment(checkoutPlan)}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loadingPlan !== null ? "Securing payment..." : `Pay ₹${(isYearly ? parseInt(checkoutPlan.price) * 12 * 1.18 : parseInt(checkoutPlan.price) * 1.18).toFixed(0)}`}
                  {loadingPlan === null && <ArrowRight size={16} />}
                </button>

                {/* Secure Trust Badges */}
                <div className="mt-6 flex justify-center items-center gap-4 text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Secure PCI-DSS</span>
                  </div>
                  <span>•</span>
                  <span>SSL Encrypted</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        <>
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
                    disabled={plan.comingSoon || plan.current || loadingPlan !== null}
                    onClick={() => setCheckoutPlan(plan)}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      plan.popular 
                        ? "bg-primary text-white hover:bg-blue-700 shadow-lg shadow-primary/25 active:scale-[0.98]" 
                        : plan.current
                          ? "bg-gray-100 text-gray-500 cursor-default"
                          : plan.comingSoon
                            ? "bg-gray-50 text-gray-300"
                            : "bg-white border border-gray-200 text-[#202124] hover:border-primary hover:text-primary active:scale-[0.98]"
                    } ${loadingPlan === plan.name ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {loadingPlan === plan.name ? "Processing..." : plan.cta}
                    {!plan.current && !plan.comingSoon && loadingPlan !== plan.name && <ArrowRight size={16} />}
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
        </>
      )}

      {/* Premium Payment Simulator Modal */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-700 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-amber-300 fill-amber-300 animate-pulse" />
                <span className="font-bold text-sm tracking-wide uppercase">Secure Payment Simulator</span>
              </div>
              {simulatorStage !== "processing" && simulatorStage !== "success" && (
                <button 
                  onClick={() => {
                    setShowSimulator(false);
                    setLoadingPlan(null);
                  }}
                  className="text-white/80 hover:text-white font-bold text-lg focus:outline-none"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center text-center">
              
              {/* STAGE: PROCESSING */}
              {simulatorStage === "processing" && (
                <div className="space-y-4 py-8">
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Processing Your Payment</h4>
                  <p className="text-xs text-gray-400 max-w-[280px]">
                    Connecting securely to AarikaAI gateway and banking channels. Please do not close or refresh this page.
                  </p>
                </div>
              )}

              {/* STAGE: BANK OTP (Credit/Debit Card) */}
              {simulatorStage === "bank_otp" && (
                <div className="w-full space-y-5 text-left">
                  <div className="border-b border-gray-100 pb-4 text-center">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[10px] uppercase mb-2">
                      Secure 3D verification
                    </span>
                    <h4 className="text-base font-bold text-gray-800">AarikaAI Bank Partner Gateway</h4>
                    <p className="text-xs text-gray-500 mt-1">Transaction Amount: <span className="font-bold text-primary">₹{(amountPaid / 100).toFixed(2)}</span></p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed text-center">
                      An OTP has been sent to your registered mobile number ending in **{cardNumber.slice(-4) || "4444"} for card **{cardNumber.slice(-4) || "4444"}.
                    </p>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enter 6-Digit OTP</label>
                      <div className="relative group">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11 font-mono text-center tracking-[0.5em] text-lg font-bold"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">Time Remaining: <span className="font-bold text-gray-600">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</span></span>
                        <button 
                          onClick={() => { setOtpDeadline(Date.now() + 300 * 1000); setCountdown(300); }}
                          className="text-primary hover:underline font-bold"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulatedSuccess(`pay_mock_card_${Date.now()}`)}
                      disabled={otpCode.length < 6}
                      className="w-full py-3.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Pay
                    </button>

                    <button
                      onClick={() => {
                        setSimulatorStage("failure");
                        setSimulatorError("Incorrect OTP entered by user.");
                      }}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-bold text-xs tracking-wide transition-all"
                    >
                      Simulate Verification Failure
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE: UPI PENDING */}
              {simulatorStage === "upi_pending" && (
                <div className="w-full space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                      <Smartphone className="text-primary" size={32} />
                    </div>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full font-bold text-[10px] uppercase mb-2">
                      Awaiting UPI Approval
                    </span>
                    <h4 className="text-base font-bold text-gray-800">UPI Push Request Sent</h4>
                    <p className="text-xs text-gray-500 mt-1">UPI VPA: <span className="font-bold font-mono text-gray-700">{upiId}</span></p>
                    <p className="text-xs text-gray-500">Amount: <span className="font-bold text-primary">₹{(amountPaid / 100).toFixed(2)}</span></p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left space-y-2">
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      1. Open your UPI app (GPay, PhonePe, BHIM, etc.) on your phone.
                    </p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      2. Approve the pending payment request from **AarikaAI** within the timer limit.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-400">
                      Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                    </div>
                    
                    <button
                      onClick={() => handleSimulatedSuccess(`pay_mock_upi_${Date.now()}`)}
                      className="w-full py-3.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 tracking-wide transition-all active:scale-[0.98]"
                    >
                      Simulate App Approval (Success)
                    </button>

                    <button
                      onClick={() => {
                        setSimulatorStage("failure");
                        setSimulatorError("Payment request timed out or rejected in UPI App.");
                      }}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-bold text-xs tracking-wide transition-all"
                    >
                      Simulate App Rejection (Failure)
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE: NETBANKING LOGIN */}
              {simulatorStage === "netbanking_login" && (
                <div className="w-full space-y-5 text-left">
                  <div className="border-b border-gray-100 pb-4 text-center">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-[10px] uppercase mb-2">
                      Secure Netbanking Portal
                    </span>
                    <h4 className="text-base font-bold text-gray-800">
                      {selectedBank === "HDFC" && "HDFC Bank"}
                      {selectedBank === "SBIN" && "State Bank of India"}
                      {selectedBank === "ICICI" && "ICICI Bank"}
                      {selectedBank === "UTIB" && "Axis Bank"}
                      {selectedBank === "KKBK" && "Kotak Mahindra Bank"}
                      {selectedBank === "PUNB" && "Punjab National Bank"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Transaction Amount: <span className="font-bold text-primary">₹{(amountPaid / 100).toFixed(2)}</span></p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">User ID / Customer ID</label>
                      <div className="relative group">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                        <input
                          type="text"
                          placeholder="Enter Netbanking User ID"
                          value={netbankingUserId}
                          onChange={(e) => setNetbankingUserId(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Netbanking Password</label>
                      <div className="relative group">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={netbankingPassword}
                          onChange={(e) => setNetbankingPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-gray-400 h-11"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulatedSuccess(`pay_mock_net_${Date.now()}`)}
                      disabled={!netbankingUserId || !netbankingPassword}
                      className="w-full py-3.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Securely Login & Pay
                    </button>

                    <button
                      onClick={() => {
                        setSimulatorStage("failure");
                        setSimulatorError("Netbanking authentication failed. Incorrect credentials.");
                      }}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-bold text-xs tracking-wide transition-all"
                    >
                      Simulate Login Failure
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE: SUCCESS */}
              {simulatorStage === "success" && (
                <div className="space-y-5 py-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                      <Check className="w-8 h-8 font-bold text-emerald-500" strokeWidth={3} />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">🎉 Payment Successful!</h4>
                  <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                    Your account has been upgraded to AarikaAI Premium. Your active subscription is now live.
                  </p>
                  <button
                    onClick={closeSimulator}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/10"
                  >
                    Go to Profile
                  </button>
                </div>
              )}

              {/* STAGE: FAILURE */}
              {simulatorStage === "failure" && (
                <div className="space-y-5 py-6 w-full">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                      <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">❌ Payment Failed</h4>
                  <p className="text-xs text-red-500 bg-red-50/50 p-3 rounded-2xl max-w-[280px] mx-auto leading-relaxed border border-red-100">
                    {simulatorError || "Something went wrong during the checkout process."}
                  </p>
                  <div className="flex gap-3 justify-center max-w-[280px] mx-auto">
                    <button
                      onClick={() => {
                        setSimulatorStage("processing");
                        setTimeout(() => {
                          if (paymentMethod === "card") {
                            setSimulatorStage("bank_otp");
                            setOtpDeadline(Date.now() + 300 * 1000);
                            setCountdown(300);
                          } else if (paymentMethod === "upi") {
                            setSimulatorStage("upi_pending");
                            setOtpDeadline(Date.now() + 180 * 1000);
                            setCountdown(180);
                          } else if (paymentMethod === "netbanking") {
                            setSimulatorStage("netbanking_login");
                          }
                        }, 1000);
                      }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs tracking-wide transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={closeSimulator}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-md shadow-red-500/10"
                    >
                      Cancel Checkout
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
};

export default SubscriptionPage;
