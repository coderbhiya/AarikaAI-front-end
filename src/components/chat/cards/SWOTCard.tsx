import React from "react";
import { ShieldAlert, Zap, Target, TrendingDown } from "lucide-react";

interface SWOTData {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

interface SWOTCardProps {
    data: SWOTData;
}

const SWOTCard: React.FC<SWOTCardProps> = ({ data }) => {
    return (
        <div className="premium-card p-5 w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500 delay-400 overflow-hidden">
            <h4 className="text-[17px] font-semibold text-[#202124] tracking-tight mb-5 px-1">Strategic SWOT Mapping</h4>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Strengths */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <Zap size={14} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Strengths</span>
                    </div>
                    <ul className="space-y-1.5">
                        {data.strengths.slice(0, 2).map((item, i) => (
                            <li key={i} className="text-[12px] text-emerald-900/80 leading-tight">• {item}</li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                        <TrendingDown size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Weaknesses</span>
                    </div>
                    <ul className="space-y-1.5">
                        {data.weaknesses.slice(0, 2).map((item, i) => (
                            <li key={i} className="text-[12px] text-orange-900/80 leading-tight">• {item}</li>
                        ))}
                    </ul>
                </div>

                {/* Opportunities */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Target size={14} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Opportunities</span>
                    </div>
                    <ul className="space-y-1.5">
                        {data.opportunities.slice(0, 2).map((item, i) => (
                            <li key={i} className="text-[12px] text-blue-900/80 leading-tight">• {item}</li>
                        ))}
                    </ul>
                </div>

                {/* Threats */}
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100">
                    <div className="flex items-center gap-2 mb-2 text-red-600">
                        <ShieldAlert size={14} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Threats</span>
                    </div>
                    <ul className="space-y-1.5">
                        {data.threats.slice(0, 2).map((item, i) => (
                            <li key={i} className="text-[12px] text-red-900/80 leading-tight">• {item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 text-[#202124] text-[13px] font-semibold tracking-tight transition-all active:scale-[0.98]">
                View Detailed Audit
            </button>
        </div>
    );
};

export default SWOTCard;
