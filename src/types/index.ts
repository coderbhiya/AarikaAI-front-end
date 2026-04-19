export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  name?: string | null;
  photoURL: string | null;
  phone?: string;
  role?: string;
  UserProfile?: any;
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
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  message: string;
  role: "user" | "assistant";
  FileAttachments?: FileAttachment[] | null;
  createdAt: string | Date;
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
