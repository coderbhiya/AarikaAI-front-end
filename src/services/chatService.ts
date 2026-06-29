import axiosInstance from "@/lib/axios";
import { Message, FileAttachment } from "@/types";

export const getChats = async (threadId?: string): Promise<Message[]> => {
  const response = await axiosInstance.get("/chat", {
    params: threadId ? { threadId } : {}
  });
  return response.data.chats;
};

export const sendChatMessage = async (
  message: string,
  fileAttachments: FileAttachment[] = [],
  webSearch?: boolean,
  engine?: string,
  onChunk?: (chunk: any) => void,
  signal?: AbortSignal,
  threadId?: string,
  activeVideoId?: string,
  isPersonalized?: boolean
): Promise<{ reply: string; citations: any[]; artifact?: any }> => {
  const token = localStorage.getItem("authToken");
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, fileAttachments, webSearch, engine, threadId, activeVideoId, isPersonalized }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 499) {
      throw new Error("AbortError");
    }
    throw new Error("Failed to send message");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let finalReply = "";
  let accumulatedReply = "";
  let finalCitations: any[] = [];
  let finalArtifact: any = null;
  let buffer = "";

  if (reader) {
    try {
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
                  finalArtifact = data.artifact || null;
                } else if (data.type === "text") {
                  accumulatedReply += data.content;
                  if (onChunk) onChunk(data);
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
    } catch (e: any) {
      if (e.name === "AbortError" || e.message === "AbortError") {
        console.log("Stream aborted manually");
        return { reply: accumulatedReply, citations: finalCitations, artifact: finalArtifact };
      }
      throw e;
    }
  }

  // Bug #1 fix: prefer accumulatedReply (built chunk-by-chunk) over finalReply from the `done`
  // event, which may be truncated or an empty string if the backend omits it.
  return { reply: accumulatedReply || finalReply, citations: finalCitations, artifact: finalArtifact };
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

export const getWelcomeMessage = async (threadId?: string): Promise<Message | null> => {
  const response = await axiosInstance.get("/chat/welcome", {
    params: threadId ? { threadId } : {}
  });
  return response.data.message || null;
};

export const truncateChat = async (messageId: number): Promise<void> => {
  await axiosInstance.delete(`/chat/truncate/${messageId}`);
};
