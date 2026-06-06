import React, { useState } from "react";
import { UserCog, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TwinUpdateCardProps {
    message: string;
    proposedChanges: Record<string, any>;
}

const TwinUpdateCard: React.FC<TwinUpdateCardProps> = ({ message, proposedChanges }) => {
    const [isAccepted, setIsAccepted] = useState(false);

    const handleAccept = () => {
        setIsAccepted(true);
        // Note: In a real implementation this would emit an API call to /career-twin/approve-update
        toast.success("Twin Updated! Your new career goals are saved.");
    };

    return (
        <div className="premium-card p-5 w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500 delay-100 border border-purple-100 bg-purple-50/30">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/10 shadow-sm">
                    <UserCog size={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-[17px] font-semibold text-[#202124] tracking-tight">Career Twin Update</h4>
            </div>

            <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
                {message || "Should I update your Career Twin with these new insights?"}
            </p>

            {proposedChanges && Object.keys(proposedChanges).length > 0 && (
                <div className="mb-5 bg-white/50 border border-purple-100/50 rounded-lg p-3">
                    <p className="text-[11px] uppercase font-bold tracking-wider text-gray-400 mb-2">Proposed Changes</p>
                    <ul className="space-y-1.5">
                        {Object.entries(proposedChanges).map(([key, value], i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px]">
                                <span className="font-medium text-purple-600/70">{key}:</span>
                                <span className="text-gray-700 font-medium">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button 
                onClick={handleAccept}
                disabled={isAccepted}
                className={`w-full py-2.5 rounded-xl text-[13px] font-semibold tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isAccepted 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                    : "bg-purple-600 hover:bg-purple-700 text-white active:scale-[0.98]"
                }`}>
                <CheckCircle2 size={16} />
                {isAccepted ? "Twin Updated" : "Accept Update"}
            </button>
        </div>
    );
};

export default TwinUpdateCard;
