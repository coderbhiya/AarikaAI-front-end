import React from "react";
import { Message } from "@/types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  onSendMessage?: (text: string) => void;
  onEditMessage?: (messageId: string | number, newText: string) => void;
  onPinNote?: (title: string, content: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onSendMessage, onEditMessage, onPinNote }) => {
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-5xl mx-auto pb-4 px-2 sm:px-4">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id || message.tempId || `msg-${index}-${String(message.createdAt || index)}`}
          message={message}
          onSendMessage={onSendMessage}
          onEditMessage={onEditMessage}
          onPinNote={onPinNote}
        />
      ))}
    </div>
  );
};

export default MessageList;
