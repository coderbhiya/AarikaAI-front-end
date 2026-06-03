import React from "react";
import { Compass, CheckCircle2, Circle } from "lucide-react";

interface RoadmapStep {
    title: string;
    duration: string;
    isCompleted?: boolean;
}

interface RoadmapCardProps {
    title: string;
    steps: RoadmapStep[];
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ title, steps }) => {
    return (
        <div className="premium-card p-5 w-full max-w-none mt-4 animate-in fade-in zoom-in-95 duration-500 delay-100 border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
            <div className="flex items-center gap-2.5 mb-2 border-b border-gray-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-[#202124] flex items-center justify-center text-white shadow-md">
                    <Compass size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="text-[17px] font-bold text-[#202124] tracking-tight leading-none">{title}</h4>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mt-1 block">Mission Roadmap</span>
                </div>
            </div>

            <div className="overflow-x-auto py-16 scrollbar-hide">
                <div className="relative flex items-center px-16" style={{ minWidth: `${Math.max(steps.length * 200, 500)}px`, height: "160px" }}>
                    {/* The Horizontal Road Background */}
                    <div className="absolute left-4 right-4 h-12 bg-[#333538] shadow-inner overflow-hidden border-y-[4px] border-[#4b4e52] rounded-full">
                        {/* Yellow dashed center line */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(to_right,transparent,transparent_16px,#facc15_16px,#facc15_32px)]"></div>
                    </div>

                    {/* Roadmap Nodes */}
                    <div className="relative w-full flex justify-between z-10">
                        {steps.map((step, index) => {
                            const isTop = index % 2 === 0;
                            return (
                                <div key={index} className="relative flex flex-col items-center justify-center w-8">
                                    {/* The connecting pin line */}
                                    <div className={`absolute ${isTop ? 'bottom-1/2 mb-2' : 'top-1/2 mt-2'} w-1 h-12 ${step.isCompleted ? 'bg-emerald-400' : 'bg-[#facc15]'} z-0`}></div>
                                    
                                    {/* Content Card */}
                                    <div className={`absolute ${isTop ? 'bottom-[4.5rem]' : 'top-[4.5rem]'} w-40 bg-white rounded-xl p-2.5 shadow-md border border-gray-100 text-center z-20 transition-transform hover:scale-105`}>
                                        <p className="text-[11px] font-bold text-slate-800 leading-tight mb-1">{step.title}</p>
                                        <p className="text-[9px] font-bold tracking-wider uppercase text-slate-400">{step.duration}</p>
                                    </div>

                                    {/* Circular Icon Wrapper */}
                                    <div className={`absolute ${isTop ? 'bottom-8' : 'top-8'} w-10 h-10 rounded-full ${step.isCompleted ? 'bg-emerald-400' : 'bg-[#facc15]'} border-[3px] border-white flex items-center justify-center z-20 shadow-lg`}>
                                        {step.isCompleted ? <CheckCircle2 size={18} className="text-white" /> : <Circle size={14} className="text-[#854d0e] fill-[#854d0e]" />}
                                    </div>

                                    {/* Dot on the road */}
                                    <div className={`w-4 h-4 rounded-full z-10 border-4 border-[#333538] ${step.isCompleted ? 'bg-emerald-400' : 'bg-[#facc15]'}`}></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <button 
                onClick={() => {
                    import("sonner").then(m => m.toast.success("Mission Accepted! Added to your Journey Board."));
                }}
                className="w-full mt-2 py-3 rounded-xl bg-[#202124] hover:bg-black text-white text-[14px] font-semibold tracking-tight transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                Accept Mission
            </button>
        </div>
    );
};

export default RoadmapCard;
