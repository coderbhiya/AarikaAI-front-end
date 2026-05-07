import React from "react";
import { School, MapPin, GraduationCap, DollarSign, Award, Globe, ExternalLink } from "lucide-react";

interface College {
  name: string;
  ranking: string;
  reason: string;
  requirements: string;
  fees: string;
  website?: string;
}

interface CollegeCardProps {
  colleges: College[];
}

const CollegeCard: React.FC<CollegeCardProps> = ({ colleges }) => {
  return (
    <div className="premium-card w-full mt-4 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-2">
        <School size={20} className="text-primary" />
        <h3 className="font-bold text-[#202124] tracking-tight">Recommended Colleges</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {colleges.map((college, index) => (
          <div key={index} className="p-5 hover:bg-gray-50/50 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                {college.website ? (
                  <a 
                    href={college.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-2"
                  >
                    <h4 className="text-[17px] font-bold text-[#202124] group-hover/link:text-primary transition-colors leading-tight">
                      {college.name}
                    </h4>
                    <ExternalLink size={14} className="text-gray-400 group-hover/link:text-primary transition-colors" />
                  </a>
                ) : (
                  <h4 className="text-[17px] font-bold text-[#202124] leading-tight">
                    {college.name}
                  </h4>
                )}
                <div className="flex items-center gap-2 text-primary/80 mt-1">
                  <Award size={14} />
                  <span className="text-[12px] font-semibold uppercase tracking-wider">{college.ranking}</span>
                </div>
              </div>
            </div>

            <p className="text-[14px] text-[#444746] leading-relaxed mb-4">
              {college.reason}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
                  <GraduationCap size={14} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Requirements</p>
                  <p className="text-[13px] text-[#202124] font-medium mt-0.5">{college.requirements}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                  <DollarSign size={14} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Estimated Fees</p>
                  <p className="text-[13px] text-[#202124] font-medium mt-0.5">{college.fees}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollegeCard;
