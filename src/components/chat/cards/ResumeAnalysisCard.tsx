import React from "react";
import { FileText, Target, CheckCircle, Search } from "lucide-react";

interface Insight {
    category: string;
    points: string[];
}

interface ResumeAnalysisCardProps {
    score: number;
    insights: Insight[];
}

const ResumeAnalysisCard: React.FC<ResumeAnalysisCardProps> = ({ score, insights }) => {
    return (
        <div className="premium-card p-5 w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500 delay-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-[17px] font-semibold text-[#202124] tracking-tight">Logic Precision</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">ATS Scanning Engine v2.0</p>
                </div>
                <div className="relative flex items-center justify-center">
                    <svg className="w-14 h-14 translate-x-1 -translate-y-1">
                        <circle
                            className="text-gray-100"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="24"
                            cx="28"
                            cy="28"
                        />
                        <circle
                            className="text-primary"
                            strokeWidth="4"
                            strokeDasharray={24 * 2 * Math.PI}
                            strokeDashoffset={24 * 2 * Math.PI * (1 - score / 100)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="24"
                            cx="28"
                            cy="28"
                        />
                    </svg>
                    <span className="absolute text-[13px] font-bold text-[#202124]">{score}</span>
                </div>
            </div>

            <div className="space-y-5 mb-6">
                {insights.map((insight, index) => (
                    <div key={index}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                            <span className="text-[11px] font-bold text-[#202124] uppercase tracking-widest">{insight.category}</span>
                        </div>
                        <div className="space-y-2 pl-3.5">
                            {insight.points.map((point, pIdx) => (
                                <div key={pIdx} className="flex items-start gap-2">
                                    <CheckCircle size={10} className="text-emerald-500 mt-1 shrink-0" />
                                    <p className="text-[13px] text-[#444746] leading-snug">{point}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#202124] text-[12px] font-semibold tracking-tight transition-all border border-gray-100 flex items-center justify-center gap-1.5">
                    <Search size={14} />
                    Find Jobs
                </button>
                <button className="py-2.5 rounded-xl bg-primary text-white text-[12px] font-semibold tracking-tight transition-all shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5">
                    <Target size={14} />
                    Optimize
                </button>
            </div>
        </div>
    );
};

export default ResumeAnalysisCard;
