"use client";

import React, { useEffect, useState } from "react";
import { Brain, Activity, Target, Zap, Clock, TrendingUp, AlertCircle, Briefcase, Sparkles, Compass } from "lucide-react";
import api from "@/lib/axios";

interface Memory {
  id: number;
  type: string;
  content: string;
  intensity: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

interface JourneyData {
  state: string;
  progress: {
    metrics: {
      roadmapCompletedSteps: number;
      learningStreaks: number;
      consistencyScore: number;
      daysSinceActive: number;
    };
    roadmapStatus: string;
  };
  memories: Memory[];
  notifications: Notification[];
}

const CareerJourneyTab = () => {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const response = await api.get("/profile/journey");
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch journey data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, []);

  const getStateColor = (state: string) => {
    switch (state) {
      case "progressing": return "bg-green-100 text-green-700 border-green-200";
      case "stagnant": return "bg-red-100 text-red-700 border-red-200";
      case "preparing": return "bg-purple-100 text-purple-700 border-purple-200";
      case "learning": return "bg-blue-100 text-blue-700 border-blue-200";
      case "applying": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "progressing": return <TrendingUp size={18} />;
      case "stagnant": return <AlertCircle size={18} />;
      case "preparing": return <Target size={18} />;
      case "learning": return <Brain size={18} />;
      case "applying": return <Briefcase size={18} />;
      default: return <Compass size={18} />;
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome & State Area */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Persistent Journey</h1>
          <p className="text-gray-500 mt-1">Aarika is tracking your momentum and psychological state to keep you on path.</p>
        </div>
        {data && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStateColor(data.state)} font-semibold shadow-sm`}>
            {getStateIcon(data.state)}
            <span className="capitalize">{data.state} State</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Progress & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Consistency Widget */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Activity className="text-primary" size={20} />
              Momentum Engine
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50/50 rounded-lg p-4 text-center border border-blue-100">
                <p className="text-sm font-semibold text-blue-600 mb-1">Learning Streak</p>
                <p className="text-3xl font-black text-blue-700">{data?.progress?.metrics?.learningStreaks || 0}</p>
                <p className="text-xs text-gray-500 mt-1">milestones hit</p>
              </div>
              <div className="bg-purple-50/50 rounded-lg p-4 text-center border border-purple-100">
                <p className="text-sm font-semibold text-purple-600 mb-1">Consistency</p>
                <p className="text-3xl font-black text-purple-700">{data?.progress?.metrics?.consistencyScore || 0}</p>
                <p className="text-xs text-gray-500 mt-1">out of 10</p>
              </div>
              <div className="bg-green-50/50 rounded-lg p-4 text-center border border-green-100">
                <p className="text-sm font-semibold text-green-600 mb-1">Roadmap Steps</p>
                <p className="text-3xl font-black text-green-700">{data?.progress?.metrics?.roadmapCompletedSteps || 0}</p>
                <p className="text-xs text-gray-500 mt-1">completed</p>
              </div>
              <div className="bg-orange-50/50 rounded-lg p-4 text-center border border-orange-100">
                <p className="text-sm font-semibold text-orange-600 mb-1">Inactivity</p>
                <p className="text-3xl font-black text-orange-700">{Math.floor(data?.progress?.metrics?.daysSinceActive || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
            </div>
          </div>

          {/* Memory Vault */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Brain className="text-primary" size={20} />
              Aarika's Memory Vault
            </h2>
            <p className="text-sm text-gray-500 mb-4">Aarika automatically extracts these psychological signals during your chats to adapt to you.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data?.memories.map((mem) => (
                <div key={mem.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-3 hover:shadow-md transition-shadow">
                  <div className={`p-2 rounded-lg ${mem.type === 'goals' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {mem.type === 'goals' ? <Target size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{mem.type.replace("_", " ")}</p>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{mem.content}</p>
                    {mem.intensity && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${mem.intensity * 10}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!data?.memories || data.memories.length === 0) && (
                <div className="col-span-full p-8 text-center text-gray-400">
                  Chat with Aarika about your goals and fears to populate the memory vault.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Insights & Alerts */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Zap size={64} />
            </div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
              <Sparkles size={20} /> Proactive Insights
            </h2>
            <p className="text-blue-100 text-sm mb-4 relative z-10">
              These insights are generated automatically when the engine detects a drop in momentum.
            </p>
            <div className="space-y-3 relative z-10">
              {data?.notifications.map((notif) => (
                <div key={notif.id} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <p className="text-xs font-semibold text-blue-200 mb-1 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-sm mb-1">{notif.title}</p>
                  <p className="text-xs text-blue-50 leading-relaxed">{notif.message}</p>
                </div>
              ))}
              {(!data?.notifications || data.notifications.length === 0) && (
                <div className="text-sm text-blue-200 text-center py-4">
                  No proactive alerts right now. Keep up the momentum!
                </div>
              )}
            </div>
          </div>

          {/* Roadmap Mini-Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Target className="text-primary" size={20} />
              Roadmap Status
            </h2>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${data?.progress?.roadmapStatus === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                <Compass size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 capitalize">{data?.progress?.roadmapStatus || 'None'} Roadmap</p>
                <p className="text-xs text-gray-500">
                  {data?.progress?.roadmapStatus === 'active' 
                    ? 'You have an active plan. Check your intelligence chat for steps.' 
                    : 'Ask Aarika to generate a career roadmap.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CareerJourneyTab;
