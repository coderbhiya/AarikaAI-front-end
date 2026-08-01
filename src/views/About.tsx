"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Cpu,
  Award,
  Zap,
  BookOpen,
  Users,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Target,
  TrendingUp,
  Globe,
  Database,
  FileText,
  HelpCircle,
  ChevronDown,
  Info
} from "lucide-react";
import BrainLogo from "@/components/BrainLogo";

interface FaqItem {
  question: string;
  answer: string;
  bullets?: string[];
}

const About = () => {
  const navigate = useRouter();
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate.back();
    } else {
      navigate.push(isAuthenticated ? "/chat" : "/");
    }
  };

  const faqData: FaqItem[] = [
    {
      question: "Which competitive exams and use cases are supported on Aarika.AI?",
      answer: "Aarika.AI supports leading high-stakes competitive examinations and professional skill assessments with authentic PYQ RAG context:",
      bullets: [
        "CA Foundation (ICAI Blueprint Alignment & Past Year Questions)",
        "UPSC Civil Services (Prelims & Mains General Studies)",
        "NTA NEET UG & JEE Main / Advanced",
        "NIMCET (MCA Entrance) & GATE",
        "Skill Assessments & Custom Target Syllabi"
      ]
    },
    {
      question: "What key features make Aarika.AI different from generic test series?",
      answer: "Unlike static test PDFs or generic question banks, Aarika.AI delivers an autonomous learning ecosystem with:",
      bullets: [
        "Adaptive PYQ RAG Alignment matching authentic exam standards",
        "AarikaAI MemoryOS learning continuity that tracks weak areas across attempts",
        "Real-time Difficulty Calibration (20% Easy, 55% Medium, 25% Hard)",
        "Instant step-by-step mathematical & logical model solutions"
      ]
    },
    {
      question: "How does Aarika.AI help students and aspirants improve scores?",
      answer: "Aarika.AI acts as a personal AI mentor to optimize your preparation efficiency:",
      bullets: [
        "Pinpoints exact weak topics through automated attempt telemetry",
        "Eliminates redundant questions you have already mastered",
        "Provides real-time pacing timers and exam strategy analytics",
        "Delivers custom practice blueprints for high-yield score maximization"
      ]
    },
    {
      question: "What is Resume Intelligence & Skill Gap Delta Analysis?",
      answer: "For job seekers and working professionals, Aarika.AI bridges the gap between your resume and market demand:",
      bullets: [
        "Parses uploaded resumes in real-time",
        "Compares credentials against live industry job requirements",
        "Identifies missing technical and domain skill gaps",
        "Generates step-by-step career evolution roadmaps"
      ]
    },
    {
      question: "Is Aarika.AI free to use for students and aspirants?",
      answer: "Yes! Aarika.AI offers a free tier allowing students and job seekers to access core AI career guidance, resume scoring, and full-length exam simulations without any mandatory upfront payment or credit card."
    },
    {
      question: "Is my personal data, resume, and test attempt history secure?",
      answer: "Absolutely. All data is encrypted in transit via TLS 1.3 and at rest using enterprise AES-256 encryption. SenseforgeAI enforces strict privacy policies: your personal information, resumes, and test attempts are NEVER sold, rented, or commercialized to third parties."
    }
  ];

  // JSON-LD Structured Data Schema for Google & AI Answer Engines (ChatGPT, Gemini, Perplexity, Claude)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://aarikaai.in/#organization",
        "name": "SenseforgeAI",
        "legalName": "Senseforge Technologies",
        "url": "https://senseforge.in",
        "logo": "https://aarikaai.in/aarika-logo.png",
        "email": "dave@senseforge.in",
        "telephone": "+91 91746 99025",
        "sameAs": ["https://senseforge.in", "https://aarikaai.in"],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91 91746 99025",
          "contactType": "customer support",
          "email": "dave@senseforge.in",
          "areaServed": "IN"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://aarikaai.in/#software",
        "name": "Aarika.AI",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        },
        "description": "Aarika.AI by SenseforgeAI is an autonomous AI career co-pilot and adaptive exam simulator for CA Foundation, UPSC, NEET, JEE, and NIMCET aspirants."
      },
      {
        "@type": "FAQPage",
        "@id": "https://aarikaai.in/about/#faq",
        "mainEntity": faqData.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer + (faq.bullets ? " " + faq.bullets.join(", ") : "")
          }
        }))
      }
    ]
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-white text-gray-800 font-sans selection:bg-primary/20 scroll-smooth">
      {/* Inject JSON-LD Schema for Search Engines & AI Models */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Top Header Navigation ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 md:px-12 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate.push(isAuthenticated ? "/chat" : "/")}>
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
              <BrainLogo size={32} />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">Aarika.AI</span>
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={16} /> {isAuthenticated ? "Back to App" : "Back to Home"}
          </button>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">

        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 shadow-2xs">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                SenseforgeAI Platform
              </a>
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            Aarika.AI — Next-Gen AI Career & Adaptive Exam Simulator
          </h1>

          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed">
            <strong>Aarika.AI</strong> (developed by{" "}
            <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">
              SenseforgeAI
            </a>
            ) is an autonomous AI co-pilot that helps students master competitive exams like <strong>CA Foundation, UPSC, NEET, JEE, and NIMCET</strong> while empowering professionals with AI resume scoring and career roadmaps.
          </p>
        </section>

        {/* ── AI Engine & Human Snapshot Box (Optimized for Gemini, ChatGPT, Perplexity, Claude) ── */}
        <section className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/80 border border-blue-100 rounded-3xl p-6 md:p-8 mb-16 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">At a Glance: What is Aarika.AI?</h2>
              <p className="text-xs text-gray-500 font-medium">Quick summary for students, job seekers, and AI search engines</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm text-gray-700 font-medium">
            <div className="p-4 rounded-2xl bg-white border border-gray-200/60 shadow-2xs">
              <span className="font-bold text-primary block mb-1">🎯 Core Mission & Purpose:</span>
              <p className="leading-relaxed">To make high-stakes test preparation and career strategy accessible, adaptive, and 100% personalized using artificial intelligence.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200/60 shadow-2xs">
              <span className="font-bold text-emerald-600 block mb-1">📚 Supported Competitive Exams:</span>
              <p className="leading-relaxed">CA Foundation (ICAI), UPSC CSE, NTA NEET (UG), NTA JEE Main/Advanced, NIMCET (MCA Entrance), GATE, and Skill Assessments.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200/60 shadow-2xs">
              <span className="font-bold text-purple-600 block mb-1">🧠 AarikaAI MemoryOS:</span>
              <p className="leading-relaxed">Remembers weak topics across tests so users never repeat mastered questions and get tailored practice recommendations.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200/60 shadow-2xs">
              <span className="font-bold text-amber-600 block mb-1">💼 Resume Intelligence:</span>
              <p className="leading-relaxed">Parses uploaded resumes in real-time, identifies missing technical skills, and generates step-by-step career growth roadmaps.</p>
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-blue-100/40 border border-blue-100 text-center shadow-2xs">
            <p className="text-2xl md:text-3xl font-black text-primary mb-1">100K+</p>
            <p className="text-xs font-semibold text-gray-600">Aspirants Guided</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-100/40 border border-emerald-100 text-center shadow-2xs">
            <p className="text-2xl md:text-3xl font-black text-emerald-600 mb-1">99.4%</p>
            <p className="text-xs font-semibold text-gray-600">Pattern Accuracy</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-100/40 border border-purple-100 text-center shadow-2xs">
            <p className="text-2xl md:text-3xl font-black text-purple-600 mb-1">500+</p>
            <p className="text-xs font-semibold text-gray-600">Exam Blueprints</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-100/40 border border-amber-100 text-center shadow-2xs">
            <p className="text-2xl md:text-3xl font-black text-amber-600 mb-1">&lt; 50ms</p>
            <p className="text-xs font-semibold text-gray-600">Response Speed</p>
          </div>
        </section>

        {/* What Makes Aarika.AI Unique */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Key Features: How Aarika.AI Helps You Succeed
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Our autonomous AI architecture combines deep domain knowledge with adaptive real-time feedback loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-2xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">1. Real-Time Adaptive Exam Simulator</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Simulates exact ICAI (CA Foundation), NTA (NEET/JEE), UPSC, and NIMCET exam patterns with authentic PYQ RAG alignment, custom difficulty distribution (Easy 20%, Medium 55%, Hard 25%), and step-by-step model solutions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-2xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">2. Resume Intelligence & Skill Alignment</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Parses uploaded resumes in real-time, extracts core competencies, detects missing skills, and auto-syncs profile data to generate tailored career growth recommendations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-2xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Cpu size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">3. AarikaAI MemoryOS Intelligence</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Remembers user learning milestones, weak topics, and assessment attempts over time to deliver continuous, personalized career guidance without repeating baseline questions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-2xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Briefcase size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">4. Mission & Job Match Routing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connects academic preparation directly to active market opportunities, providing interactive roadmaps, SWOT analysis, and skill gap visualization.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission & Values */}
        <section className="bg-gray-50 border border-gray-200/80 rounded-3xl p-8 md:p-10 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Our Core Mission & Standards</h2>
          </div>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
            At{" "}
            <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-900 hover:underline">
              SenseforgeAI
            </a>
            , we believe every aspirant deserves access to top-tier, personalized mentorship and exam preparation regardless of location or background. Aarika.AI was built to democratize high-stakes test preparation and career strategy through state-of-the-art AI technology.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-gray-800 font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Compromise on Accuracy:</strong> Multi-gate question validation engines enforce exact legal, mathematical, and logical standards.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-800 font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Privacy-First Architecture:</strong> Bank-grade encryption (TLS 1.3 & AES-256) with zero data monetization.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-800 font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Continuous Innovation:</strong> Real-time RAG integration for 2026-2027 regulatory updates and syllabus shifts.</span>
            </div>
          </div>
        </section>

        {/* ── Interactive FAQ Section ── */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <HelpCircle size={14} />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Everything You Need to Know About Aarika.AI
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Answers to common questions from students, aspirants, and professionals before starting on our platform.
            </p>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xs hover:border-primary/30"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-gray-900 text-sm md:text-base cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100 font-normal animate-in fade-in duration-200">
                      <p className="mb-2.5 font-medium text-gray-800">{faq.answer}</p>
                      {faq.bullets && faq.bullets.length > 0 && (
                        <ul className="space-y-1.5 pl-2">
                          {faq.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2.5 text-gray-700 font-medium">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact & Company Details */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Get in Touch with SenseforgeAI</h2>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl mb-8">
              Have questions, partnership inquiries, or feedback? Contact our team directly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="mailto:dave@senseforge.in"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Us</p>
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 truncate">dave@senseforge.in</p>
                </div>
              </a>

              <a
                href="tel:+919174699025"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Phone size={18} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Call Us</p>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">+91 91746 99025</p>
                </div>
              </a>

              <a
                href="https://senseforge.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Globe size={18} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Official Website</p>
                  <p className="text-xs font-bold text-white group-hover:text-purple-300 truncate">senseforge.in</p>
                </div>
              </a>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        </section>

        {/* Footer info */}
        <div className="mt-12 text-center text-gray-400 text-xs font-medium">
          <p>
            © 2026{" "}
            <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-700 transition-colors font-bold">
              SenseforgeAI
            </a>{" "}
            • Aarika.AI All Rights Reserved.
          </p>
        </div>

      </main>
    </div>
  );
};

export default About;
