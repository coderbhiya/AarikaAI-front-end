"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function MarketingPage() {
  const { user } = useAuth();
  
  // Email Form State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailAudience, setEmailAudience] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // WhatsApp Form State
  const [waMessage, setWaMessage] = useState("");
  const [waAudience, setWaAudience] = useState("");
  const [isSendingWa, setIsSendingWa] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailBody || !emailAudience) {
      toast.error("Please fill all email fields");
      return;
    }
    
    setIsSendingEmail(true);
    try {
      const token = localStorage.getItem("authToken");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/marketing/email`, {
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
      const token = localStorage.getItem("authToken");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp`, {
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

  if (user?.role !== "admin") {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Marketing Center</h1>
        <p className="text-gray-500 mt-2">Manage your Email and WhatsApp campaigns.</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSendEmail} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject Line</Label>
              <Input
                id="emailSubject"
                placeholder="e.g. Exclusive Offer for AarikaAI Users!"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailAudience">Target Emails (comma separated)</Label>
              <Input
                id="emailAudience"
                placeholder="e.g. user1@example.com, user2@example.com"
                value={emailAudience}
                onChange={(e) => setEmailAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailBody">Email Body (HTML supported)</Label>
              <Textarea
                id="emailBody"
                placeholder="Write your email content here..."
                className="min-h-[200px]"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSendingEmail}>
              {isSendingEmail ? "Sending Campaign..." : "Send Email Campaign"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSendWhatsapp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="waAudience">Target Phone Numbers (with country code, comma separated)</Label>
              <Input
                id="waAudience"
                placeholder="e.g. +919876543210, +1234567890"
                value={waAudience}
                onChange={(e) => setWaAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waMessage">WhatsApp Message</Label>
              <Textarea
                id="waMessage"
                placeholder="Type your WhatsApp message..."
                className="min-h-[200px]"
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSendingWa}>
              {isSendingWa ? "Sending Campaign..." : "Send WhatsApp Campaign"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
