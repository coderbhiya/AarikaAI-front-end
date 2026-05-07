import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface QuizCardProps {
  options: Record<string, string>;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ options, onSelect, disabled }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    if (disabled || selected) return;
    setSelected(key);
    onSelect(key);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mt-4 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            disabled={disabled || !!selected}
            className={`
              flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left
              ${selected === key 
                ? "bg-primary/10 border-primary shadow-sm" 
                : "bg-white border-gray-100 hover:border-primary/30 hover:shadow-md hover:translate-x-1"}
              ${disabled && selected !== key ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm
              ${selected === key ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 transition-colors"}
            `}>
              {key}
            </div>
            <span className={`text-[14px] ${selected === key ? "font-semibold text-primary" : "text-[#3c4043]"}`}>
              {value}
            </span>
            {selected === key && (
              <CheckCircle2 size={18} className="ml-auto text-primary" />
            )}
          </button>
        ))}
      </div>
      
      {selected && (
        <p className="text-[11px] text-gray-400 italic px-2">
          Answer submitted: {selected}
        </p>
      )}
    </div>
  );
};

export default QuizCard;
