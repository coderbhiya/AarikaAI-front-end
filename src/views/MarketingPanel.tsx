import React, { useState } from "react";
import { toast } from "sonner";

export default function MarketingPanel() {
  // Email Form State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailAudience, setEmailAudience] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // WhatsApp Form State
  const [waMessage, setWaMessage] = useState("");
  const [waAudience, setWaAudience] = useState("");
  const [isSendingWa, setIsSendingWa] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<"email" | "whatsapp">("email");

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailBody || !emailAudience) {
      toast.error("Please fill all email fields");
      return;
    }
    
    setIsSendingEmail(true);
    try {
      // Use the admin token here
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:3002/api/marketing/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          audience: emailAudience.split(",").map((s) => s.trim()),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Email campaign sent successfully!");
        setEmailSubject("");
        setEmailBody("");
        setEmailAudience("");
      } else {
        toast.error(data.message || "Failed to send email campaign");
      }
    } catch (error) {
      toast.error("An error occurred while sending emails");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waMessage || !waAudience) {
      toast.error("Please fill all WhatsApp fields");
      return;
    }

    setIsSendingWa(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:3002/api/marketing/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: waMessage,
          audience: waAudience.split(",").map((s) => s.trim()),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("WhatsApp campaign sent successfully!");
        setWaMessage("");
        setWaAudience("");
      } else {
        toast.error(data.message || "Failed to send WhatsApp campaign");
      }
    } catch (error) {
      toast.error("An error occurred while sending WhatsApp messages");
    } finally {
      setIsSendingWa(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex gap-4">
        <button
          onClick={() => setActiveSubTab("email")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === "email" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-200"
          }`}
        >
          Email Marketing
        </button>
        <button
          onClick={() => setActiveSubTab("whatsapp")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeSubTab === "whatsapp" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-200"
          }`}
        >
          WhatsApp Marketing
        </button>
      </div>

      <div className="p-6">
        {activeSubTab === "email" && (
          <form onSubmit={handleSendEmail} className="space-y-5 max-w-3xl">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. Exclusive Offer for AarikaAI Users!"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Target Emails (comma separated)</label>
              <input
                type="text"
                value={emailAudience}
                onChange={(e) => setEmailAudience(e.target.value)}
                placeholder="e.g. user1@example.com, user2@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Body (HTML supported)</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your email content here..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:bg-white transition-all outline-none min-h-[200px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingEmail}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              {isSendingEmail ? "Sending Campaign..." : "Send Email Campaign"}
            </button>
          </form>
        )}

        {activeSubTab === "whatsapp" && (
          <form onSubmit={handleSendWhatsapp} className="space-y-5 max-w-3xl">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Target Phone Numbers (with country code, comma separated)</label>
              <input
                type="text"
                value={waAudience}
                onChange={(e) => setWaAudience(e.target.value)}
                placeholder="e.g. +919876543210, +1234567890"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">WhatsApp Message</label>
              <textarea
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                placeholder="Type your WhatsApp message..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:bg-white transition-all outline-none min-h-[200px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingWa}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              {isSendingWa ? "Sending Campaign..." : "Send WhatsApp Campaign"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
