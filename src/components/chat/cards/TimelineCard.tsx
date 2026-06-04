import React from "react";
import { Target, Award } from "lucide-react";

interface TimelineEvent {
    type: string;
    description: string;
    date: string;
}

interface TimelineCardProps {
    month: string;
    events: TimelineEvent[];
}

const TimelineCard: React.FC<TimelineCardProps> = ({ month, events }) => {
    if (!events || events.length === 0) return null;

    return (
        <div className="w-full max-w-none mt-2 animate-in fade-in zoom-in-95 duration-500 delay-100">
            <div className="relative flex flex-col items-center w-full py-6">
                {/* Vertical Road Background */}
                <div className="absolute top-0 bottom-0 w-12 bg-[#333538] shadow-inner overflow-hidden border-x-[4px] border-[#4b4e52] rounded-full left-1/2 -translate-x-1/2">
                    {/* Yellow dashed center line */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_16px,#facc15_16px,#facc15_32px)]"></div>
                </div>

                {/* Timeline Nodes */}
                <div className="relative w-full flex flex-col gap-8 z-10 px-1 md:px-4">
                    {events.map((event, index) => {
                        const isLeft = index % 2 === 0;
                        return (
                            <div key={index} className="relative w-full flex items-center z-10 min-h-[70px]">
                                {/* Central Dot */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-[#333538] bg-[#facc15] z-10"></div>
                                
                                {/* Icon */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#facc15] border-[3px] border-white flex items-center justify-center z-20 shadow-lg">
                                    {event.type === "milestone" ? <Target size={18} className="text-[#854d0e] fill-white" /> : <Award size={18} className="text-[#854d0e] fill-white" />}
                                </div>

                                {/* Connecting Line */}
                                <div className={`absolute top-1/2 -translate-y-1/2 h-1 bg-[#facc15] z-0 ${isLeft ? 'right-1/2 w-[12%]' : 'left-1/2 w-[12%]'}`}></div>

                                {/* Card */}
                                <div className={`w-[38%] md:w-[35%] bg-white rounded-xl p-2.5 shadow-md border border-gray-100 text-center z-20 transition-transform hover:scale-105 ${isLeft ? 'mr-auto' : 'ml-auto'}`}>
                                    <p className="text-[11px] font-bold text-slate-800 leading-snug mb-1">{event.description}</p>
                                    <p className="text-[9px] font-bold tracking-wider uppercase text-slate-400">{event.date}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineCard;
