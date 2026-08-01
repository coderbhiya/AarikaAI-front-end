"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, ShieldCheck, Lock, Globe, FileText, CheckCircle2 } from "lucide-react";
import BrainLogo from "@/components/BrainLogo";
import { useAuth } from "@/contexts/AuthContext";

const Privacy = () => {
  const navigate = useRouter();
  const { isAuthenticated } = useAuth();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate.back();
    } else {
      navigate.push(isAuthenticated ? "/chat" : "/");
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-white text-gray-800 font-sans selection:bg-gray-200 scroll-smooth">
      {/* ── Top Header Bar (ChatGPT Clean Navigation) ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 md:px-12 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      {/* ── Main Article Container ── */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">

        {/* Title & Effective Date */}
        <div className="mb-10 pb-8 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold mb-4">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Official Policy</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Effective Date: <span className="text-gray-800 font-semibold">August 1, 2026</span>
          </p>
        </div>

        {/* Intro */}
        <div className="prose prose-gray max-w-none text-sm md:text-base leading-relaxed text-gray-700 space-y-4 mb-10">
          <p>
            At <strong>Aarika.AI</strong> (operated by <strong>Senseforge</strong>), we respect your privacy and are strongly committed to keeping secure any information we obtain from you or about you.
          </p>
          <p>
            This Privacy Policy describes our practices with respect to Personal Information we collect from or about you when you access or use our website, mobile applications, AI career tools, and services (collectively, <strong>&ldquo;Services&rdquo;</strong>).
          </p>
        </div>

        {/* Table of Contents (ChatGPT Quick Nav) */}
        <div className="bg-gray-50/80 border border-gray-200/60 rounded-2xl p-6 mb-12">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Table of Contents</h3>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm font-medium text-primary">
            <li>
              <button onClick={() => scrollToSection("section-1")} className="hover:underline text-left">
                1. Personal Information We Collect
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("section-2")} className="hover:underline text-left">
                2. How We Use Personal Information
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("section-3")} className="hover:underline text-left">
                3. Disclosure & Data Sharing
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("section-4")} className="hover:underline text-left">
                4. Data Security & Encryption
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("section-5")} className="hover:underline text-left">
                5. Your Rights & Data Ownership
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("section-6")} className="hover:underline text-left">
                6. Contact Information
              </button>
            </li>
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-12 text-sm md:text-base text-gray-700 leading-relaxed">

          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-24 pt-4 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              1. Personal Information We Collect
            </h2>
            <p className="mb-4">
              We collect personal information that you provide to us directly, as well as information generated automatically when you interact with our Services:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>Account Information:</strong> When you register an account, we collect your name, email address, contact details, and account credentials.
              </li>
              <li>
                <strong>Career & Resume Data:</strong> When you use our Resume Intelligence or Mock Assessment tools, we process uploaded resume files, target exam selections, skill levels, and educational background.
              </li>
              <li>
                <strong>User Prompts & Telemetry:</strong> Chat prompts, messages, uploaded attachments, and telemetry logs created during your interactions with AarikaAI to synthesize personalized learning recommendations via MemoryOS.
              </li>
              <li>
                <strong>Automatically Collected Technical Data:</strong> Browser type, IP address, operating system, and session usage logs to maintain service reliability and security.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-24 pt-4 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              2. How We Use Personal Information
            </h2>
            <p className="mb-4">
              We use Personal Information for the following legitimate business purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>To provide, personalize, and maintain our AI career intelligence, mock tests, and learning modules.</li>
              <li>To train localized contextual memory models (MemoryOS) strictly tailored to your individual academic and career goals.</li>
              <li>To communicate with you regarding service updates, security alerts, customer support, and administrative notices.</li>
              <li>To prevent fraudulent activity, enforce our Terms of Service, and safeguard our infrastructure against security threats.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-24 pt-4 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              3. Disclosure & Data Sharing
            </h2>
            <p className="mb-4 font-semibold text-gray-900">
              We do NOT sell, rent, or trade your Personal Information to third parties or advertisers.
            </p>
            <p className="mb-4">
              We may disclose your information strictly under the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>Vendors and Service Providers:</strong> Trusted cloud hosts, database infrastructure, authentication services, and LLM API providers operating under strict enterprise privacy agreements with zero permission to use your data for public model training.
              </li>
              <li>
                <strong>Legal Compliance:</strong> When required to satisfy applicable law, regulation, legal process, or governmental request.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-24 pt-4 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              4. Data Security & Encryption
            </h2>
            <p className="mb-4">
              We implement industry-standard technical and organizational security measures to protect your data. All data transmitted between your client browser and our servers is encrypted using <strong>TLS 1.3 / SSL</strong> protocols, and data at rest is secured with <strong>AES-256</strong> enterprise encryption.
            </p>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-24 pt-4 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              5. Your Rights & Data Ownership
            </h2>
            <p className="mb-4">
              You maintain complete ownership of your personal data. Subject to applicable laws, you have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Access & Export:</strong> Request a complete copy of the personal information we hold about you.</li>
              <li><strong>Correction & Deletion:</strong> Request correction of inaccurate information or permanent erasure of your account and data history.</li>
              <li><strong>Memory Clear:</strong> Clear stored chat threads and memory context directly from your application settings.</li>
            </ul>
          </section>

          {/* Section 6 - Contact Info */}
          <section id="section-6" className="scroll-mt-24 pt-6 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              6. Contact Information
            </h2>
            <p className="mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data rights, please contact our data governance team directly:
            </p>

            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Contact</p>
                  <a href="mailto:dave@senseforge.in" className="text-sm md:text-base font-bold text-primary hover:underline">
                    dave@senseforge.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Telephone Contact</p>
                  <a href="tel:+919174699025" className="text-sm md:text-base font-bold text-gray-900 hover:text-primary transition-colors">
                    +91 91746 99025
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Entity & Base</p>
                  <p className="text-sm md:text-base font-bold text-gray-900">
                    Senseforge HQ <span className="text-gray-400">•</span> India
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer info */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-xs font-medium text-gray-400">
          <p>
            © 2026{" "}
            <a href="https://senseforge.in" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-700 transition-colors font-semibold">
              SenseforgeAI
            </a>{" "}
            • AarikaAI. All rights reserved.
          </p>
        </div>

      </main>
    </div>
  );
};

export default Privacy;
