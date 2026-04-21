"use client";

import React, { useState } from "react";
import {
    Sparkles,
    ArrowLeft,
    User,
    Mail,
    Lock,
    Shield,
    Activity,
    Cpu,
    Phone
} from "lucide-react";
import BrainLogo from "@/components/BrainLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/auth";

export const RegisterPage: React.FC = () => {
    const isMobile = useIsMobile();
    const { toast } = useToast();
    const navigate = useRouter();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Validation Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: formData.name,
            });

            const token = await user.getIdToken();

            const response = await axiosInstance.post("/auth/verify-token", {
                idToken: token,
                userData: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                }
            });

            if (response.data.success) {
                login(response.data.user, response.data.token);

                toast({
                    title: "Registration Complete",
                    description: "Your professional profile has been created.",
                });

                setTimeout(() => {
                    navigate.replace("/chat");
                }, 1000);
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            let message = "Could not create account";
            if (error.code === 'auth/email-already-in-use') {
                message = 'An account with this email already exists.';
            }

            toast({
                title: "Registration Failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white overflow-hidden selection:bg-primary/20">
            {/* Visual Side (Desktop) */}
            {!isMobile && (
                <div className="hidden lg:flex lg:w-1/2 bg-[#f8faff] relative overflow-hidden items-center justify-center border-r border-slate-100 p-12">
                    <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[80%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-400/5 blur-[100px] rounded-full animate-pulse delay-1000" />
                    <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    <div className="relative z-10 p-12 max-w-xl animate-in fade-in slide-in-from-left-6 duration-700">
                        <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/10 bg-white shadow-sm">
                            <Sparkles size={11} className="text-primary" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Join Aarika.AI</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                            Build <br />
                            your <span className="text-primary italic">Future.</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-[13px] leading-relaxed mb-10 max-w-sm">
                            Create your professional profile today and let our AI-driven engine find the perfect opportunities for your unique skillset.
                        </p>

                        <div className="space-y-3">
                            {[
                                { title: "Smart Matching", desc: "Autonomous career trajectory mapping", color: "text-blue-600", bg: "bg-blue-50", icon: <Cpu size={16} /> },
                                { title: "Growth Insights", desc: "Data-driven professional analysis", color: "text-purple-600", bg: "bg-purple-50", icon: <Activity size={16} /> }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className={`shrink-0 w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.color} shadow-inner group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                                        {item.icon}
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-slate-900 font-bold text-[12px] tracking-tight mb-0.5">{item.title}</h3>
                                        <p className="text-gray-500 text-[11px] font-medium leading-tight">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Side */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 relative overflow-y-auto scrollbar-none">
                <div className="w-full max-w-[380px] pt-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
                    <Link href="/login" className="inline-flex items-center gap-2.5 text-slate-400 hover:text-slate-900 transition-all duration-500 mb-4 group">
                        <div className="p-2 bg-white border border-slate-100 rounded-lg group-hover:-translate-x-1 transition-transform shadow-sm">
                            <ArrowLeft size={13} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Back to Sign In</span>
                    </Link>

                    <div className="flex items-center gap-3.5 mb-6">
                        <BrainLogo size={42} className="rounded-lg shadow-md" />
                        <div className="flex flex-col">
                            <span className="text-[#202124] font-bold text-xl tracking-tight leading-tight">Aarika.AI</span>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-80">Join the Hub</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-3xl font-bold text-[#202124] mb-1 tracking-tight">Create account.</h2>
                        <p className="text-gray-500 text-[14px] font-medium">Join thousands of professionals on Aarika.AI.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3.5">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white transition-all duration-300 placeholder:text-gray-300 h-10.5"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white transition-all duration-300 placeholder:text-gray-300 h-10.5"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                <input
                                    type="tel"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white transition-all duration-300 placeholder:text-gray-300 h-10.5"
                                    placeholder="+91 00000 00000"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9+]/g, '');
                                        setFormData({ ...formData, phone: val });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white transition-all duration-300 placeholder:text-gray-300 h-10.5"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm</label>
                                <div className="relative group">
                                    <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[#202124] text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white transition-all duration-300 placeholder:text-gray-300 h-10.5"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 mt-2.5 rounded-lg bg-[#202124] text-white text-sm font-bold hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-50 shadow-md transition-all duration-300"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-10">
                        <p className="text-[13px] text-gray-500 font-medium">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-bold hover:underline ml-1 transition-all">Sign In</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-auto pb-6 text-center opacity-40">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Secure AES-256 Encryption • Aarika.AI Cloud</p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
