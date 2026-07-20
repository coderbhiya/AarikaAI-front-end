"use client";

import React, { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry, pingStreak } from "@/services/gamificationService";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Flame, Target, Star, Medal } from "lucide-react";

export default function LeaderboardTab() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myStreak, setMyStreak] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Ping streak to ensure it's up to date, then fetch leaderboard
      const streakRes = await pingStreak();
      setMyStreak(streakRes.data);
      
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-lg shadow-sm border border-yellow-200">🥇</div>;
    if (index === 1) return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg shadow-sm border border-gray-200">🥈</div>;
    if (index === 2) return <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg shadow-sm border border-amber-200">🥉</div>;
    return <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-sm border border-gray-100">#{index + 1}</div>;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100/50">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-700 font-semibold mb-1 text-[15px]">
            <Trophy size={18} />
            Leaderboard
          </div>
          <p className="text-gray-600 text-sm">
            Maintain your streak and climb the ranks!
          </p>
        </div>
        
        {/* User's Mini Stats */}
        {myStreak && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-orange-100">
              <Flame size={16} className="text-orange-500 fill-orange-500" />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-gray-800">{myStreak.learningStreaks || 0}</span>
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Streak</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100">
              <Star size={16} className="text-blue-500 fill-blue-500" />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-gray-800">{myStreak.consistencyScore || 0}</span>
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">XP</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50/80 border-b border-gray-100 px-4 py-3 grid grid-cols-[3rem_1fr_4rem_4rem] sm:grid-cols-[4rem_1fr_6rem_6rem] gap-3 items-center font-semibold text-[11px] text-gray-500 uppercase tracking-wider">
          <div className="text-center">Rank</div>
          <div>Student</div>
          <div className="text-center">Streak</div>
          <div className="text-right">XP</div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Loading rankings...</span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No data available yet. Start learning to be the first!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {leaderboard.map((entry, idx) => {
              const isMe = user?.email === entry.User?.name || entry.User?.name === user?.displayName; 

              return (
                <div 
                  key={entry.id} 
                  className={`px-4 py-3 grid grid-cols-[3rem_1fr_4rem_4rem] sm:grid-cols-[4rem_1fr_6rem_6rem] gap-3 items-center transition-colors hover:bg-gray-50/50 ${isMe ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex justify-center">
                    {getRankBadge(idx)}
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 border border-blue-200/50 flex items-center justify-center text-blue-700 font-bold overflow-hidden flex-shrink-0 text-sm">
                      {entry.User?.profilePicture ? (
                        <img src={entry.User.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        entry.User?.name?.charAt(0)?.toUpperCase() || "S"
                      )}
                    </div>
                    <div className="truncate">
                      <p className={`text-[14px] font-semibold truncate ${isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                        {entry.User?.name || "Student"} {isMe && <span className="text-[11px] font-medium text-blue-500 ml-1">(You)</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="flex items-center gap-1.5 text-orange-600 text-[13px] font-bold">
                      <Flame size={14} className="fill-orange-500" />
                      {entry.learningStreaks || 0}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="text-[14px] font-bold text-gray-700">
                      {entry.consistencyScore || 0} <span className="text-[11px] text-gray-400 font-semibold ml-0.5">XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
