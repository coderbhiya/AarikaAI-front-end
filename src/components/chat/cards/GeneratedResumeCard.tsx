import React, { useRef, useState } from "react";
import { Download, Copy, Check, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TemplateClassic } from "../../resume/templates/TemplateClassic";
import { TemplateModern } from "../../resume/templates/TemplateModern";

interface ExperienceItem {
    role: string;
    company: string;
    dates: string;
    points: string[];
}

interface ProjectItem {
    name: string;
    description: string;
    technologies?: string[];
}

interface EducationItem {
    degree: string;
    institution: string;
    dates: string;
}

export interface GeneratedResumeData {
    name: string;
    role: string;
    location?: string;
    email?: string;
    phone?: string;
    summary: string;
    skills: string[];
    experience: ExperienceItem[];
    projects: ProjectItem[];
    education: EducationItem[];
    certifications?: any[];
    achievements?: any[];
    hobbies?: string[];
}

function normalizeResumeData(raw: any): GeneratedResumeData {
    let skills: string[] = [];
    if (Array.isArray(raw.skills)) {
        skills = raw.skills.map((s: any) => (typeof s === "string" ? s : s.name || "")).filter(Boolean);
    } else if (raw.skills && typeof raw.skills === "object") {
        skills = Object.values(raw.skills).flat().filter((s): s is string => typeof s === "string");
    }

    const rawExp: any[] = raw.experiences || raw.experience || raw.workExperience || raw.work_experience || [];
    const experience: ExperienceItem[] = rawExp.map((e: any) => {
        const company =
            e.companyName ||
            e.company ||
            e.company_name ||
            e.CompanyName ||
            e.organization ||
            e.employer ||
            "";

        const start = e.startDate || e.start_date || e.from || "";
        const end = e.endDate || e.end_date || e.to || "Present";
        const dates = e.dates || e.duration || e.period || e.date || (start || end ? `${start} - ${end}` : "");

        return {
            role: e.role || e.title || e.position || "",
            company: company || "",
            dates: dates || "",
            points: Array.isArray(e.points) ? e.points
                : Array.isArray(e.responsibilities) ? e.responsibilities
                    : Array.isArray(e.achievements) ? e.achievements
                        : typeof e.description === "string" ? [e.description]
                            : [],
        };
    });

    const rawProj: any[] = raw.projects || raw.keyProjects || [];
    const projects: ProjectItem[] = rawProj.map((p: any) => ({
        name: p.name || p.title || "",
        description: p.description || p.summary || "",
        technologies: Array.isArray(p.technologies) ? p.technologies
            : Array.isArray(p.techStack) ? p.techStack
                : [],
    }));

    const rawEdu: any[] = raw.education || [];
    const education: EducationItem[] = rawEdu.map((e: any) => ({
        degree: e.degree || e.qualification || e.course || "",
        institution: e.institution || e.school || e.university || e.college || "",
        dates: e.dates || e.duration || e.year || e.period || "",
    }));

    const certifications = raw.certifications || [];
    const achievements = raw.achievements || [];
    const hobbies = raw.hobbies || [];

    return {
        name: raw.name || "Aakash Dave",
        role: raw.role || raw.title || raw.designation || raw.currentRole || "Software Engineer",
        location: raw.location || "India",
        email: raw.email || raw.emailAddress || "aakash.davegroup@gmail.com",
        phone: raw.phone || raw.phoneNumber || raw.mobile || "",
        summary: raw.summary || raw.professionalSummary || raw.objective || raw.bio || "",
        skills,
        experience,
        projects,
        education,
        certifications,
        achievements,
        hobbies
    };
}

const GeneratedResumeCard: React.FC<{ data: any }> = ({ data: rawData }) => {
    const data = normalizeResumeData(rawData);

    const resumeRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern'>('classic');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDownload = async () => {
        if (!resumeRef.current) return;
        try {
            setIsDownloading(true);
            const element = resumeRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 800,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `${data.name ? data.name.replace(/\s+/g, "_") : "Resume"}_CV.pdf`;
            pdf.save(fileName);
        } catch (err) {
            console.error("PDF generation error:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCopy = () => {
        const text = `
${data.name.toUpperCase()}
${data.role} | ${data.location} | ${data.email} | ${data.phone}

SUMMARY
${data.summary}

SKILLS
${data.skills.join(", ")}

EXPERIENCE
${data.experience.map(e => `${e.role} - ${e.company} (${e.dates})\n${e.points.map(p => `• ${p}`).join("\n")}`).join("\n\n")}

PROJECTS
${data.projects.map(p => `${p.name}: ${p.description}`).join("\n\n")}

EDUCATION
${data.education.map(e => `${e.degree} - ${e.institution} (${e.dates})`).join("\n")}
        `.trim();

        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <>
            {/* CARD TRIGGER - Initial View */}
            <div className="w-full max-w-sm mx-auto my-6">
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-400 cursor-pointer transition-all duration-300 overflow-hidden group"
                >
                    {/* Card Header */}
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    {data.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{data.role}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-4">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 line-clamp-3">
                                {data.summary || "Professional resume ready to download"}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.slice(0, 3).map((skill: string, i: number) => (
                                <span key={i} className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {skill}
                                </span>
                            ))}
                            {data.skills.length > 3 && (
                                <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                                    +{data.skills.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Click to open editor</span>
                        <Download className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>

            {/* MODAL - 2-Part Layout */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">

                        {/* MODAL HEADER */}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <h2 className="text-xl font-bold text-gray-900">{data.name} - Resume Editor</h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* LEFT SIDE - Controls (Mobile: Hidden) */}
                        <div className="hidden md:flex md:w-80 bg-white border-r border-gray-200 flex-col pt-16 shrink-0">
                            {/* Template Selector */}
                            <div className="px-6 py-5 border-b border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Template</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value as any)}
                                    className="w-full text-sm bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 text-gray-700 font-medium cursor-pointer transition-colors"
                                >
                                    <option value="classic">Professional Classic</option>
                                    <option value="modern">Modern Analyst</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 py-5 flex-1 flex flex-col gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Download size={18} />
                                    {isDownloading ? "Generating..." : "Download PDF"}
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="w-full px-4 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
                                    title="Copy to clipboard"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check size={18} className="text-emerald-500" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            <span>Copy Text</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Info Box */}
                            <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    ✨ <span className="font-semibold">Tip:</span> Download as PDF for best results. Changes are reflected instantly.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT SIDE - Resume Preview */}
                        <div className="flex-1 bg-gray-100 p-4 md:p-6 overflow-auto pt-20 md:pt-16">
                            <div className="flex justify-center items-start">
                                <div className="w-full max-w-[900px]">
                                    <div
                                        ref={resumeRef}
                                        className="bg-white shadow-2xl"
                                        style={{
                                            width: "210mm",
                                            minHeight: "297mm",
                                            padding: "16mm 20mm",
                                            boxSizing: "border-box",
                                            fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
                                        }}
                                    >
                                        {/* Resume Content */}
                                        {selectedTemplate === 'classic' ? (
                                            <TemplateClassic data={data} />
                                        ) : (
                                            <TemplateModern data={data} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Bottom Bar */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                                className="flex-1 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="classic">Classic</option>
                                <option value="modern">Modern</option>
                            </select>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                            >
                                <Download size={16} />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GeneratedResumeCard;