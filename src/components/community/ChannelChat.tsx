"use client";

import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { Send, Hash, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function ChannelChat({ channel }: { channel: any }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let newSocket: Socket;

    const connectSocket = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      newSocket = io(SOCKET_URL, {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("Connected to community socket");
        newSocket.emit("join_channel", { channelId: channel.id });
      });

      newSocket.on("channel_history", (history: any[]) => {
        setMessages(history);
      });

      newSocket.on("new_message", (message: any) => {
        setMessages((prev) => {
          // If this message has a tempId, replace the optimistic message
          if (message.tempId) {
            const exists = prev.find(m => m.tempId === message.tempId || m.id === message.id);
            if (exists) {
              return prev.map(m => m.tempId === message.tempId ? message : m);
            }
          }
          // Otherwise, just append it
          return [...prev, message];
        });
      });

      newSocket.on("guard_warning", (data: any) => {
        setMessages((prev) => {
          // Remove the optimistic message if it was blocked
          const filtered = data.tempId ? prev.filter(m => m.tempId !== data.tempId) : prev;
          return [
            ...filtered, 
            { 
              message: data.message, 
              isSystem: true, 
              createdAt: new Date().toISOString() 
            }
          ];
        });
      });

      setSocket(newSocket);
    };

    connectSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [channel.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;
    
    // Optimistic UI Update
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      id: tempId,
      tempId,
      message: inputValue,
      userId: user?.uid, // Approximation for local use
      User: {
        id: user?.uid,
        name: user?.displayName || "You",
        handle: user?.displayName ? user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') : "you",
        profilePicture: user?.photoURL
      },
      createdAt: new Date().toISOString(),
      isPending: true
    };
    
    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("send_message", { channelId: channel.id, message: inputValue, tempId });
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 shadow-sm z-10">
        <Hash className="text-gray-400" size={20} />
        <div>
          <h3 className="font-semibold text-gray-800">{channel.name}</h3>
          <p className="text-xs text-gray-500">{channel.description}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => {
          if (msg.isSystem) {
            return (
              <div key={idx} className="flex justify-center my-4">
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-medium border border-red-100 flex items-center gap-2 shadow-sm">
                  <span>⚠️</span>
                  {msg.message}
                </div>
              </div>
            );
          }

          const isCurrentUser = msg.User?.id === user?.uid || msg.userId === user?.uid; // Approximation
          const isAi = msg.isAiReply || msg.User?.id === "aarika-bot";
          
          return (
            <div key={idx} className={`flex gap-3 max-w-[80%] ${isCurrentUser ? "ml-auto flex-row-reverse" : ""} ${msg.isPending ? "opacity-70" : ""}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {isAi ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-primary">
                    <Bot size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {msg.User?.profilePicture ? (
                      <img src={msg.User.profilePicture} alt="User" />
                    ) : (
                      <span className="text-xs font-semibold text-gray-500">
                        {msg.User?.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-sm font-semibold ${isAi ? "text-primary" : "text-gray-800"}`}>
                    {isAi ? "AarikaAI" : msg.User?.handle ? `@${msg.User.handle}` : msg.User?.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(msg.createdAt || Date.now()), "h:mm a")}
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm ${isCurrentUser ? "bg-primary text-white rounded-tr-none" : isAi ? "bg-blue-50 text-gray-800 border border-blue-100 rounded-tl-none" : "bg-[#F0F4F9] text-gray-800 rounded-tl-none"}`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message #${channel.name} (tag @aarika for AI help)`}
            className="w-full pl-4 pr-12 py-3 bg-[#F0F4F9] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 p-2 rounded-full bg-primary text-white disabled:opacity-50 disabled:bg-gray-300 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
