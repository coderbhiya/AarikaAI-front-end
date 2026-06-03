import React, { useEffect, useState } from "react";
import { Trophy, Flame, Star, Sparkles } from "lucide-react";

interface BadgeCardProps {
  type: string;
  message: string;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ type, message }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Basic delayed effect to represent the celebration
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (type.toLowerCase()) {
      case "streak": return <Flame size={24} className="text-orange-500" />;
      case "milestone": return <Trophy size={24} className="text-yellow-500" />;
      default: return <Star size={24} className="text-blue-500" />;
    }
  };

  const getGradient = () => {
    switch (type.toLowerCase()) {
      case "streak": return "from-orange-50 to-orange-100 border-orange-200";
      case "milestone": return "from-yellow-50 to-yellow-100 border-yellow-200";
      default: return "from-blue-50 to-blue-100 border-blue-200";
    }
  };

  return (
    <div className={`relative p-5 w-full max-w-sm mt-4 rounded-2xl border bg-gradient-to-br ${getGradient()} shadow-sm animate-in zoom-in-95 duration-500`}>
      {showConfetti && (
        <div className="absolute -top-4 -right-4 animate-bounce">
            <Sparkles className="text-yellow-400 fill-yellow-400" size={32} />
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center animate-pulse">
            {getIcon()}
        </div>
        <div>
            <h4 className="text-[17px] font-bold text-[#202124] tracking-tight capitalize">
                {type} Unlocked!
            </h4>
            <p className="text-[13px] text-gray-700 font-medium mt-1 leading-snug">
                {message}
            </p>
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;
