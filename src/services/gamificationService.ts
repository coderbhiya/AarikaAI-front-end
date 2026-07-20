import axiosInstance from "@/lib/axios";

export interface LeaderboardEntry {
  id: number;
  consistencyScore: number;
  learningStreaks: number;
  lastActiveDate: string;
  User: {
    id: number;
    name: string;
    profilePicture: string | null;
    credits: number;
  }
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await axiosInstance.get(`/api/gamification/leaderboard`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

export const pingStreak = async () => {
  try {
    const response = await axiosInstance.post(`/api/gamification/streak/ping`);
    return response.data;
  } catch (error) {
    console.error("Error pinging streak:", error);
    throw error;
  }
};
