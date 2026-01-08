import React, { useState } from "react";
import { Sparkles, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/auth";

export const RegisterPage: React.FC = () => {
    const isMobile = useIsMobile();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // 2. Update profile with name
            await updateProfile(user, {
                displayName: formData.name,
            });

            // 3. Get ID Token
            const token = await user.getIdToken();

            // 4. Verify with backend to create user record
            try {
                const response = await axiosInstance.post("/auth/verify-token", {
                    idToken: token,
                    userData: {
                        name: formData.name,
                        email: formData.email,
                    }
                });

                if (response.data.success) {
                    // 5. Login and redirect
                    login(response.data.user);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    localStorage.setItem("authToken", response.data.token);

                    toast({
                        title: "Success",
                        description: "Account created successfully!",
                    });

                    setTimeout(() => {
                        navigate("/chat", { replace: true });
                    }, 1000);
                }
            } catch (apiError) {
                console.error("API verification failed:", apiError);
                toast({
                    title: "Registration Failed",
                    description: "Could not create account on server",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            let message = "Could not create account";
            if (error.code === 'auth/email-already-in-use') {
                message = 'That email address is already in use!';
            } else if (error.code === 'auth/invalid-email') {
                message = 'That email address is invalid!';
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
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Join AarikaAI</span>
                        </div>
                        <h1 className="text-6xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
                            Start your <span className="perplexity-gradient-text">Journey</span> to Excellence.
                        </h1>
                        <p className="text-gray-400 text-xl leading-relaxed mb-12">
                            Create an account to access precision AI tools, personalized career insights, and a network of opportunities.
                        </p>
                    </div>

                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
            )}

            {/* Auth Side */}
            <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-sm mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Login</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight">AarikaAI</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Create Account</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Enter your details to get started.
                    </p>
                </div>

                <form onSubmit={handleRegister} className="w-full max-w-sm space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600 pr-10"
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600 pr-10"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 flex items-center justify-center px-6 py-4 rounded-2xl bg-primary text-white font-bold transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500">
                        Already have an account?{" "}
                        <Link to="/" className="text-primary font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>

                {isMobile && (
                    <div className="mt-12 text-center pb-8">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Powered by AarikaAI Alpha</p>
                    </div>
                )}
            </div>
        </div>
    );
};
