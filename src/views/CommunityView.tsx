"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { MessageCircle, Code, FileText, Users, Hash, Menu } from "lucide-react";
import ChannelChat from "@/components/community/ChannelChat";
import { useAuth } from "@/contexts/AuthContext";

const iconMap: Record<string, any> = {
  MessageCircle,
  Code,
  FileText,
  Users
};

export default function CommunityView() {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const { toggleSidebar } = useAuth();

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
    // Phones: channels become a scrollable row above the chat (the fixed 256px
    // column left the chat a sliver), and the menu button opens the app sidebar.
    <div className="flex flex-col md:flex-row h-full min-h-0 bg-white w-full">
      {/* Channels */}
      <div className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col bg-[#F9FAFB]">
        <div className="px-3 py-2.5 md:p-4 border-b border-gray-100 flex items-center gap-2">
          <button onClick={toggleSidebar} aria-label="Open menu" className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
            <Menu size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Community</h2>
        </div>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:flex-1 p-2 md:p-3 scrollbar-none">
          {channels.map((channel) => {
            const Icon = iconMap[channel.icon] || Hash;
            const isActive = channel.id === activeChannelId;
            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`shrink-0 md:w-full whitespace-nowrap flex items-center gap-2 md:gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
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
      <div className="flex-1 min-h-0 flex flex-col">
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
