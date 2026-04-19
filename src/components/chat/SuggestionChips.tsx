import React from "react";
import { Sparkles, Briefcase, FileText, Target } from "lucide-react";

interface Suggestion {
    id: string;
    text: string;
    icon: React.ReactNode;
}

interface SuggestionChipsProps {
    onSelect: (text: string) => void;
}

const suggestions: Suggestion[] = [
    { id: "1", text: "Analyze my resume for ATS", icon: <FileText size={14} /> },
    { id: "2", text: "Find high-match remote jobs", icon: <Briefcase size={14} /> },
    { id: "3", text: "Create a 3-month career roadmap", icon: <Target size={14} /> },
    { id: "4", text: "Practice for a Senior Dev interview", icon: <Sparkles size={14} /> },
];

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelect }) => {
    return (
        <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex sm:flex-wrap justify-start sm:justify-center gap-2 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 scrollbar-none px-4 sm:px-0">
                {suggestions.map((suggestion) => (
                    <button
                        key={suggestion.id}
                        onClick={() => onSelect(suggestion.text)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-full text-[13px] font-medium text-[#444746] hover:bg-[#F1F3F4] hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap shrink-0"
                    >
                        <span className="text-primary">{suggestion.icon}</span>
                        {suggestion.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SuggestionChips;
