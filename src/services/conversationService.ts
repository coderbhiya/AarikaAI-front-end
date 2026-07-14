import axiosInstance from "@/lib/axios";

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  messageCount?: number;
  category?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  updatedAt: string;
  createdAt: string;
}

export const getConversations = async (page = 1, limit = 50): Promise<{ conversations: Conversation[]; total: number }> => {
  const response = await axiosInstance.get("/conversations", { params: { page, limit } });
  return { conversations: response.data.conversations, total: response.data.total };
};

export const searchConversations = async (q: string): Promise<Conversation[]> => {
  const response = await axiosInstance.get("/conversations/search", { params: { q } });
  return response.data.conversations;
};

export const updateConversation = async (id: string, data: Partial<Pick<Conversation, "title" | "isPinned" | "isArchived">>): Promise<Conversation> => {
  const response = await axiosInstance.put(`/conversations/${id}`, data);
  return response.data.conversation;
};
