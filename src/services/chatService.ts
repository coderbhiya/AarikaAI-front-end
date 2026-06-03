import axiosInstance from "@/lib/axios";
import { Message, FileAttachment } from "@/types";

export const getChats = async (): Promise<Message[]> => {
  const response = await axiosInstance.get("/chat");
  return response.data.chats;
};

export const sendChatMessage = async (
  message: string,
  fileAttachments: FileAttachment[] = [],
  webSearch?: boolean,
  onChunk?: (chunk: any) => void
): Promise<{ reply: string; citations: any[] }> => {
  const token = localStorage.getItem("authToken");
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, fileAttachments, webSearch }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let finalReply = "";
  let finalCitations: any[] = [];
  let buffer = "";

  if (reader) {
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const block = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);

          if (block.startsWith("data: ")) {
            const dataStr = block.replace("data: ", "").trim();
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "done") {
                finalReply = data.reply;
                finalCitations = data.citations || [];
              } else if (onChunk) {
                onChunk(data);
              }
            } catch (e) {
              console.error("Failed to parse block:", block, e);
            }
          }

          boundary = buffer.indexOf("\n\n");
        }
      }
    }
  }

  return { reply: finalReply, citations: finalCitations };
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

export const getWelcomeMessage = async (): Promise<Message | null> => {
  const response = await axiosInstance.get("/chat/welcome");
  return response.data.message || null;
};
