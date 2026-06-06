import React from "react";
import { Download, ExternalLink, FileText, File, ShieldCheck } from "lucide-react";

interface ResourceCardProps {
    title: string;
    type: string;
    source: string;
    url: string;
    trustScore?: number;
    action: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, type, source, url, trustScore, action }) => {
    
    // Determine icon based on file type
    const getIcon = () => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('pdf')) return <FileText size={18} />;
        if (typeLower.includes('doc') || typeLower.includes('txt')) return <File size={18} />;
        return <ExternalLink size={18} />;
    };

    return (
        <div className="premium-card p-5 w-full max-w-sm mt-4 animate-in fade-in zoom-in-95 duration-500 delay-100 border border-amber-100 bg-amber-50/20 group">
            <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/10 shadow-sm">
                    {getIcon()}
                </div>
                {trustScore && trustScore > 80 && (
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase border border-emerald-100">
                        <ShieldCheck size={12} />
                        Trusted
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h4 className="text-[16px] font-semibold text-[#202124] tracking-tight leading-snug line-clamp-2 mb-1.5">
                    {title}
                </h4>
                <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">{type}</span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{source}</span>
                </div>
            </div>

            <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98]">
                {type?.toLowerCase() === 'link' ? <ExternalLink size={16} /> : <Download size={16} />}
                {action || "View Resource"}
            </a>
        </div>
    );
};

export default ResourceCard;
