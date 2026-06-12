"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { MessageCircle, Code, FileText, Users, Hash } from "lucide-react";
import ChannelChat from "@/components/community/ChannelChat";

const iconMap: Record<string, any> = {
  MessageCircle,
  Code,
  FileText,
  Users
};

export default function CommunityView() {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await api.get("/community/channels");
        if (res.data.success) {
          setChannels(res.data.channels);
          if (res.data.channels.length > 0) {
            setActiveChannelId(res.data.channels[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch channels:", err);
      }
    };
    fetchChannels();
  }, []);

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <div className="flex h-full bg-white w-full">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-gray-100 flex flex-col bg-[#F9FAFB]">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Community</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {channels.map((channel) => {
            const Icon = iconMap[channel.icon] || Hash;
            const isActive = channel.id === activeChannelId;
            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon size={16} />
                <span>{channel.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChannelId ? (
          <ChannelChat channel={activeChannel} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a channel to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
