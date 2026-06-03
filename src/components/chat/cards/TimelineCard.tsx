import React from "react";
import { Calendar, Target, Award, ArrowRight } from "lucide-react";

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
            <div className="py-12 scrollbar-hide">
                <div className="relative flex items-center px-16" style={{ minWidth: `${Math.max(events.length * 200, 500)}px`, height: "160px" }}>
                    {/* The Horizontal Road Background */}
                    <div className="absolute left-4 right-4 h-12 bg-[#333538] shadow-inner overflow-hidden border-y-[4px] border-[#4b4e52] rounded-full">
                        {/* Yellow dashed center line */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(to_right,transparent,transparent_16px,#facc15_16px,#facc15_32px)]"></div>
                    </div>

                    {/* Timeline Nodes */}
                    <div className="relative w-full flex justify-between z-10">
                        {events.map((event, index) => {
                            const isTop = index % 2 === 0;
                            return (
                                <div key={index} className="relative flex flex-col items-center justify-center w-8">
                                    {/* The connecting pin line */}
                                    <div className={`absolute ${isTop ? 'bottom-1/2 mb-2' : 'top-1/2 mt-2'} w-1 h-12 bg-[#facc15] z-0`}></div>

                                    {/* Content Card */}
                                    <div className={`absolute ${isTop ? 'bottom-[4.5rem]' : 'top-[4.5rem]'} w-40 bg-white rounded-xl p-2.5 shadow-md border border-gray-100 text-center z-20 transition-transform hover:scale-105`}>
                                        <p className="text-[11px] font-bold text-slate-800 leading-snug mb-1 line-clamp-3">{event.description}</p>
                                        <p className="text-[9px] font-bold tracking-wider uppercase text-slate-400">{event.date}</p>
                                    </div>

                                    {/* Circular Icon Wrapper */}
                                    <div className={`absolute ${isTop ? 'bottom-8' : 'top-8'} w-10 h-10 rounded-full bg-[#facc15] border-[3px] border-white flex items-center justify-center z-20 shadow-lg`}>
                                        {event.type === "milestone" ? <Target size={18} className="text-[#854d0e] fill-white" /> : <Award size={18} className="text-[#854d0e] fill-white" />}
                                    </div>

                                    {/* Dot on the road */}
                                    <div className={`w-4 h-4 rounded-full z-10 border-4 border-[#333538] bg-[#facc15]`}></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineCard;
