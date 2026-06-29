import React from "react";
import { Message } from "@/types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  onSendMessage?: (text: string) => void;
  onEditMessage?: (messageId: string | number, newText: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onSendMessage, onEditMessage }) => {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onSendMessage={onSendMessage} onEditMessage={onEditMessage} />
      ))}
    </div>
  );
};

export default MessageList;
