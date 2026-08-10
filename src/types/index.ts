export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  name?: string | null;
  photoURL: string | null;
  phone?: string;
  role?: string;
  onboardingCompleted?: boolean;
  UserProfile?: any;
  credits?: number;
  hasSharedOnLinkedIn?: boolean;
  createdAt?: string;
}

export interface FileAttachment {
  id: number;
  filePath: string;
  chatMessageId: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  message: string;
  role: "user" | "assistant";
  responseType?: "TEXT_RESPONSE" | "WIDGET_RESPONSE" | "ACTION_RESPONSE";
  enginePayload?: any;
  FileAttachments?: FileAttachment[] | null;
  citations?: any[] | null;
  artifact?: any;
  tempId?: string;
  selectedTool?: string;
  timestamp?: number;
  createdAt: string | Date;
}

export interface AITool {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: "campus" | "resume" | "exam" | "analytics" | "career" | "study";
  icon: string;
  badge?: string;
  placeholder: string;
  samplePrompts: string[];
}

export interface ChatResponse {
  chats: Message[];
}

export interface AIResponse {
  reply: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  skills: Skill[];
  experiences: Experience[];
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
