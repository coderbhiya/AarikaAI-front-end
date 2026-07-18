"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { Upload, Download, Clock, CheckCircle2, XCircle, Loader2, Send, QrCode } from "lucide-react";


interface Campaign {
  id: number;
  title: string;
  status: string;
  totalAudience: number;
  sentCount: number;
  failedCount: number;
  scheduledAt: string | null;
  createdAt: string;
}

export function WhatsappMarketingTab() {
  const [title, setTitle] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  const [waStatus, setWaStatus] = useState("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchWaStatus = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("authToken");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) return;
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Invalid server response");
      }
      if (res.ok && data.success) {
        setWaStatus(data.data.status);
        setQrCode(data.data.qrCode);
      }
    } catch (error) {
      console.error("Failed to fetch WhatsApp status", error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("authToken");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        toast.error("API URL not configured");
        return;
      }
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Invalid server response");
      }
      if (res.ok && data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
      toast.error("Unable to load campaigns");
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchWaStatus();
    
    // Poll campaigns every 5 seconds to update counts in real-time
    const campaignInterval = setInterval(() => {
      fetchCampaigns();
    }, 5000);
    return () => clearInterval(campaignInterval);
  }, []);

  const isConnected = waStatus === "ready";
  const isSyncing = waStatus === "authenticated";

  useEffect(() => {
    if (waStatus === "ready") return; // Stop polling only if ready
    const interval = setInterval(() => {
      fetchWaStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [waStatus]);

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,phone\nJohn Doe,+919876543210\nJane Doe,+1234567890";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "whatsapp_audience_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title || !messageTemplate || !file) {
      toast.error("Please fill all required fields and upload a CSV.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a valid CSV file.");
      return;
    }

    if (mediaType === "video" && videoUrl) {
      try {
        new URL(videoUrl);
      } catch {
        toast.error("Invalid video URL");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("authToken");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) throw new Error("API URL missing");
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("messageTemplate", messageTemplate);
      
      if (mediaType === "video" && videoUrl) formData.append("videoUrl", videoUrl);
      if (mediaType === "image" && imageFile) formData.append("image", imageFile);
      
      if (scheduledAt) formData.append("scheduledAt", new Date(scheduledAt).toISOString());
      formData.append("file", file);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/campaign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Invalid server response");
      }
      if (res.ok && data.success) {
        toast.success(data.message || "Campaign created successfully!");
        setTitle("");
        setMessageTemplate("");
        setMediaType("none");
        setImageFile(null);
        setVideoUrl("");
        setScheduledAt("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchCampaigns(); // Refresh list
      } else {
        toast.error(data.message || "Failed to create campaign");
      }
    } catch (error) {
      toast.error("An error occurred while creating the campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      
      {/* WhatsApp Connection Status */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
            <QrCode size={20} className="text-emerald-600" />
            WhatsApp Device Connection
          </h3>
          <p className="text-sm text-slate-600">
            {waStatus === "ready" 
              ? "Your WhatsApp account is successfully linked. You can now send campaigns." 
              : waStatus === "authenticated"
              ? "Your WhatsApp account is authenticated. Please wait while chats are syncing..."
              : "Link your WhatsApp account to send campaigns directly without Meta approvals."}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold">
            Status: 
            <span className={waStatus === "ready" ? "text-emerald-600" : waStatus === "authenticated" ? "text-amber-600" : "text-slate-600 uppercase"}>
              {waStatus}
            </span>
          </div>
        </div>
        
        <div className="shrink-0 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          {waStatus === "ready" ? (
            <div className="w-40 h-40 flex flex-col items-center justify-center bg-emerald-50 rounded-md border border-emerald-100 text-emerald-600">
              <CheckCircle2 size={48} className="mb-2" />
              <span className="text-sm font-bold">Connected</span>
            </div>
          ) : waStatus === "authenticated" ? (
            <div className="w-40 h-40 flex flex-col items-center justify-center bg-amber-50 rounded-md border border-amber-100 text-amber-600 p-2 text-center">
              <Loader2 size={32} className="animate-spin mb-2" />
              <span className="text-xs font-bold">Syncing Chats...</span>
            </div>
          ) : qrCode ? (
            <img src={qrCode} width={160} height={160} alt="WhatsApp QR Code" className="w-40 h-40 object-contain" />
          ) : (
            <div className="w-40 h-40 flex flex-col items-center justify-center bg-slate-50 rounded-md border border-slate-100 text-slate-400">
              <Loader2 size={24} className="animate-spin mb-2" />
              <span className="text-xs">Loading QR...</span>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Creation Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Campaign</h2>
            <p className="text-sm text-gray-500">Send personalized WhatsApp messages in bulk.</p>
          </div>
          <Button variant="outline" onClick={handleDownloadTemplate} size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV Template
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Diwali Offer 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Attachment Type (Optional)</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={mediaType === "none"} onChange={() => setMediaType("none")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" /> None
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={mediaType === "image"} onChange={() => setMediaType("image")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" /> Image Upload
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={mediaType === "video"} onChange={() => setMediaType("video")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" /> Video URL
                  </label>
                </div>
              </div>

              {mediaType === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="imageFile">Upload Image</Label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              )}

              {mediaType === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://example.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">The URL will be appended to your message.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageTemplate">
              Message Template <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mb-2">Use <code className="bg-gray-100 px-1 rounded">{"{{Name}}"}</code> to personalize the message with the user's name from the CSV.</p>
            <Textarea
              id="messageTemplate"
              placeholder="Hi {{Name}}, we have a special offer for you!"
              className="min-h-[120px]"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="csvFile">Audience CSV <span className="text-red-500">*</span></Label>
              <div className="flex items-center gap-4">
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Schedule Time (Optional)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <p className="text-xs text-gray-500">Leave blank to start sending immediately.</p>
            </div>
          </div>

            <Button type="submit" disabled={isSubmitting || waStatus !== "ready"} className="w-full h-12 text-base font-semibold shadow-sm group">
              {isSubmitting ? (
                <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span>
              ) : waStatus !== "ready" ? (
                <span className="flex items-center gap-2">WhatsApp Not Ready</span>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Start Campaign</>
              )}
            </Button>
            {(waStatus !== "authenticated" && waStatus !== "ready") && (
              <p className="text-xs text-red-500 text-center font-medium mt-2">
                Please link your WhatsApp account first to start the campaign.
              </p>
            )}
        </form>
      </div>

      {/* Campaign History Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Campaign History</h2>
        
        {isLoadingCampaigns ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : campaigns.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No campaigns found. Create one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Audience</th>
                  <th className="px-4 py-3 text-green-600">Sent</th>
                  <th className="px-4 py-3 text-red-600">Failed</th>
                  <th className="px-4 py-3">Scheduled For</th>
                  <th className="px-4 py-3 rounded-tr-lg">Created</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{camp.title}</td>
                    <td className="px-4 py-4">
                      {camp.status === 'completed' && <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> Completed</span>}
                      {camp.status === 'running' && <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>}
                      {camp.status === 'scheduled' && <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Scheduled</span>}
                      {camp.status === 'pending' && <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium">Pending</span>}
                      {camp.status === 'failed' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Failed</span>}
                      {!['completed', 'running', 'scheduled', 'pending', 'failed'].includes(camp.status) && (
                        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium capitalize">
                          {camp.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">{camp.totalAudience}</td>
                    <td className="px-4 py-4 font-medium text-green-600">{camp.sentCount}</td>
                    <td className="px-4 py-4 font-medium text-red-600">{camp.failedCount}</td>
                    <td className="px-4 py-4">{camp.scheduledAt && isValid(new Date(camp.scheduledAt)) ? format(new Date(camp.scheduledAt), "PPp") : "Immediate"}</td>
                    <td className="px-4 py-4">{isValid(new Date(camp.createdAt)) ? format(new Date(camp.createdAt), "PP") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
