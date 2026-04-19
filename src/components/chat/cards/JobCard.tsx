import React from "react";
import { Briefcase, MapPin, DollarSign, ArrowUpRight } from "lucide-react";

interface JobCardProps {
    title: string;
    company: string;
    location: string;
    salary: string;
    matchPercentage: number;
}

const JobCard: React.FC<JobCardProps> = ({ title, company, location, salary, matchPercentage }) => {
    return (
        <div className="premium-card p-5 group cursor-pointer w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-[17px] font-semibold text-[#202124] group-hover:text-primary transition-colors leading-tight">
                        {title}
                    </h4>
                    <p className="text-[14px] text-[#444746] mt-0.5">{company}</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">
                        {matchPercentage}% Match
                    </span>
                </div>
            </div>

            <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={14} />
                    <span className="text-[13px]">{location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <DollarSign size={14} />
                    <span className="text-[13px] font-medium text-[#202124]">{salary}</span>
                </div>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-primary/5 hover:bg-primary hover:text-white border border-primary/10 text-primary text-[13px] font-semibold tracking-tight transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
                View Mission Detail
                <ArrowUpRight size={14} />
            </button>
        </div>
    );
};

export default JobCard;
