import React from "react";
import { Briefcase, MapPin, DollarSign, ArrowUpRight, Mail, Phone, ExternalLink, Star } from "lucide-react";

export interface JobCardProps {
  title: string;
  company: string;
  location?: string;
  salary?: string;
  matchPercentage?: number;
  hrEmail?: string;
  contactNumber?: string;
  companyWebsite?: string;
  applyLink?: string;
  link?: string;
  rating?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  salary,
  matchPercentage = 90,
  hrEmail,
  contactNumber,
  companyWebsite,
  applyLink,
  link,
  rating,
}) => {
  const targetUrl = applyLink || link || companyWebsite;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:shadow-xl transition-all duration-300 w-full group relative overflow-hidden">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug truncate">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
              {company}
            </span>
            {rating && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/50">
                <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                {rating}
              </span>
            )}
          </div>
        </div>

        {matchPercentage && (
          <div className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 shrink-0">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {matchPercentage}% Match
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
        {location && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={14} className="text-primary shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {salary && (
          <div className="flex items-center gap-1.5 truncate">
            <DollarSign size={14} className="text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{salary}</span>
          </div>
        )}
        {hrEmail && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail size={14} className="text-blue-500 shrink-0" />
            <a href={`mailto:${hrEmail}`} className="text-primary font-medium hover:underline truncate">
              {hrEmail}
            </a>
          </div>
        )}
        {contactNumber && (
          <div className="flex items-center gap-1.5 truncate">
            <Phone size={14} className="text-purple-500 shrink-0" />
            <a href={`tel:${contactNumber}`} className="hover:underline truncate">
              {contactNumber}
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {targetUrl ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold tracking-tight transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            Direct Apply / View Opening
            <ArrowUpRight size={15} />
          </a>
        ) : (
          <div className="flex-1 py-2 px-3 text-center text-xs text-slate-400 font-medium italic">
            Direct apply link available via HR contact above
          </div>
        )}

        {companyWebsite && (
          <a
            href={companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
            title="Visit Company Site"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );
};

export default JobCard;
