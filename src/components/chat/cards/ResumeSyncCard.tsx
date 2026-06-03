import React, { useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ResumeSyncCardProps {
    diff: any;
    snapshot: any;
}

const ResumeSyncCard: React.FC<ResumeSyncCardProps> = ({ diff, snapshot }) => {
    const [isSynced, setIsSynced] = useState(false);

    const handleSync = () => {
        setIsSynced(true);
        toast.success("Profile Updated! Your new skills and experiences are now active.");
    };

    const addedSkills = diff?.addedFields?.filter((f: any) => f.field === "skills")?.[0]?.value || [];

    return (
        <div className="premium-card p-5 w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500 delay-100 border border-blue-100 bg-blue-50/30">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/10 shadow-sm">
                    <FileText size={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-[17px] font-semibold text-[#202124] tracking-tight">Resume Intelligence</h4>
            </div>

            <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
                I've extracted your latest data. Ready to sync it to your profile?
            </p>

            {addedSkills.length > 0 && (
                <div className="mb-4">
                    <p className="text-[11px] uppercase font-bold tracking-wider text-gray-400 mb-2">New Skills Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                        {addedSkills.slice(0, 4).map((skill: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-white border border-gray-100 rounded-md text-[11px] font-medium text-gray-600 shadow-sm">
                                {skill.name}
                            </span>
                        ))}
                        {addedSkills.length > 4 && (
                            <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[11px] font-medium text-gray-400 shadow-sm">
                                +{addedSkills.length - 4} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            <button 
                onClick={handleSync}
                disabled={isSynced}
                className={`w-full py-2.5 rounded-xl text-[13px] font-semibold tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isSynced 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
                }`}>
                <CheckCircle2 size={16} />
                {isSynced ? "Profile Synced" : "Sync Extracted Data"}
            </button>
        </div>
    );
};

export default ResumeSyncCard;
