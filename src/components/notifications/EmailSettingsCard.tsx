"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { Switch } from "@/components/ui/switch";

/**
 * On/off for the daily email. Backed by NotificationPreference.channels.email
 * (GET/PUT /government/preferences); the email footer's "Email settings" link
 * lands here.
 */
export default function EmailSettingsCard() {
  const [on, setOn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [frequency, setFrequency] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/government/preferences")
      .then((res) => {
        const p = res.data?.data || {};
        setFrequency(p.frequency || null);
        setOn(p.channels?.email !== false && p.frequency !== "never");
      })
      .catch(() => setOn(null));
  }, []);

  const change = async (next: boolean) => {
    const prev = on;
    setOn(next);
    setSaving(true);
    try {
      await axiosInstance.put("/government/preferences", {
        channels: { email: next },
        // "never" also blocks email; lift it when the user turns email back on.
        ...(next && frequency === "never" ? { frequency: "daily" } : {}),
      });
      if (next && frequency === "never") setFrequency("daily");
      toast.success(next ? "Daily email turned on" : "Daily email turned off");
    } catch {
      setOn(prev);
      toast.error("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Mail size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <label htmlFor="daily-email-switch" className="block text-sm font-bold text-[#202124]">
          Daily email
        </label>
        <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
          One email a day with your new job matches and next steps. Sign-in and password codes always come through.
        </p>
      </div>
      <Switch
        id="daily-email-switch"
        checked={!!on}
        disabled={on === null || saving}
        onCheckedChange={change}
        aria-label="Daily email"
      />
    </div>
  );
}
