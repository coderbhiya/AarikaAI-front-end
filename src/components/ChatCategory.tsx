
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatCategoryProps {
  title: string;
  onClick: () => void;
}

const ChatCategory: React.FC<ChatCategoryProps> = ({ title, onClick }) => {
  return (
    <button 
      className="chat-category group" 
      onClick={onClick}
    >
      <span>{title}</span>
      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
    </button>
  );
};

export default ChatCategory;
