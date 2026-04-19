import React from "react";
import { Zap, AlertCircle } from "lucide-react";

interface Skill {
    name: string;
    isMissing?: boolean;
    priority: "high" | "medium" | "low";
}

interface SkillGapCardProps {
    skills: Skill[];
}

const SkillGapCard: React.FC<SkillGapCardProps> = ({ skills }) => {
    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "high": return "bg-red-50 text-red-600 border-red-100";
            case "medium": return "bg-orange-50 text-orange-600 border-orange-100";
            case "low": return "bg-blue-50 text-blue-600 border-blue-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    return (
        <div className="premium-card p-5 w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500 delay-200">
            <div className="flex items-center justify-between mb-5">
                <h4 className="text-[17px] font-semibold text-[#202124] tracking-tight">Mission Readiness</h4>
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 shadow-sm animate-pulse">
                    <Zap size={16} fill="currentColor" />
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
                        <div className="flex items-center gap-2.5">
                            {skill.isMissing && <AlertCircle size={14} className="text-orange-500" />}
                            <span className="text-[14px] font-medium text-[#202124]">{skill.name}</span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getPriorityStyles(skill.priority)}`}>
                            {skill.priority} Gap
                        </span>
                    </div>
                ))}
            </div>

            <button className="w-full py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary text-[13px] font-semibold tracking-tight transition-all active:scale-[0.98]">
                Start Skill Forge
            </button>
        </div>
    );
};

export default SkillGapCard;
