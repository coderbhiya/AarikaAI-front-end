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
        <div className="premium-card p-5 w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500 delay-100">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                    <Compass size={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-[17px] font-semibold text-[#202124] tracking-tight">{title}</h4>
            </div>

            <div className="space-y-4 mb-6 relative pl-2.5">
                <div className="absolute left-[13px] top-2 bottom-6 w-0.5 bg-gray-100" />
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-4 relative">
                        <div className={`mt-1 relative z-10 ${step.isCompleted ? "text-emerald-500" : "text-gray-300"}`}>
                            {step.isCompleted ? <CheckCircle2 size={10} fill="currentColor" className="text-emerald-500 bg-white rounded-full" /> : <Circle size={10} fill="currentColor" className="text-gray-200 bg-white rounded-full" />}
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-[#202124] leading-none mb-1.5">{step.title}</p>
                            <p className="text-[11px] text-gray-400 font-medium tracking-tight uppercase">{step.duration}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-2.5 rounded-xl bg-[#202124] hover:bg-slate-800 text-white text-[13px] font-semibold tracking-tight transition-all active:scale-[0.98] shadow-sm">
                Explore Full Journey
            </button>
        </div>
    );
};

export default RoadmapCard;
