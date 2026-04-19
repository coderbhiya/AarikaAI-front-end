import axiosInstance from "@/lib/axios";
import { Message, FileAttachment } from "@/types";

export const getChats = async (): Promise<Message[]> => {
  const response = await axiosInstance.get("/chat");
  return response.data.chats;
};

export const sendChatMessage = async (
  message: string,
  fileAttachments: FileAttachment[] = []
): Promise<string> => {
  const response = await axiosInstance.post("/chat", {
    message,
    fileAttachments,
  });
  return response.data.reply;
};

export const uploadFile = async (file: File): Promise<FileAttachment> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.file;
};
