import React, { useRef, useState } from "react";
import { Download, Copy, Check } from "lucide-react";
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
    summary: string;
    skills: string[];
    experience: ExperienceItem[];
    projects: ProjectItem[];
    education: EducationItem[];
    certifications?: any[];
    achievements?: any[];
    hobbies?: string[];
}

// Normalizes the raw LLM JSON into a consistent structure
// regardless of what field names the AI decides to use.
function normalizeResumeData(raw: any): GeneratedResumeData {
    // Normalize skills: handles flat array, object with categories, or string
    let skills: string[] = [];
    if (Array.isArray(raw.skills)) {
        skills = raw.skills.map((s: any) => (typeof s === "string" ? s : s.name || "")).filter(Boolean);
    } else if (raw.skills && typeof raw.skills === "object") {
        skills = Object.values(raw.skills).flat().filter((s): s is string => typeof s === "string");
    }

    // BUG FIX 1: Company name mapping
    // resumeService.js LLM prompt explicitly returns `companyName` (camelCase).
    // CRITICAL: companyName must be checked FIRST — it is the canonical field from both
    // the LLM output and the Sequelize DB model. Checking `e.company` first was wrong
    // because it silently returned "" (empty string / undefined) without falling through.
    const rawExp: any[] = raw.experiences || raw.experience || raw.workExperience || raw.work_experience || [];
    const experience: ExperienceItem[] = rawExp.map((e: any) => {
        const company =
            e.companyName ||          // PRIMARY: LLM prompt & Sequelize DB model field
            e.company ||              // generic fallback
            e.company_name ||
            e.CompanyName ||          // PascalCase ORM serializer variant
            e["company_name"] ||
            e["Company Name"] ||
            e["company name"] ||
            e.organization ||
            e.employer ||
            e.workplace ||
            e.Company ||
            "";

        const start = e.startDate || e.start_date || e.from || "";
        const end = e.endDate || e.end_date || e.to || "Present";
        const dates = e.dates || e.duration || e.period || e.date || (start || end ? `${start} - ${end}` : "");

        if (!company) {
            console.warn("[ResumeCard] company_missing in experience entry:", e);
        }
        if (!dates) {
            console.warn("[ResumeCard] dates_missing in experience entry:", e);
        }

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

    // Normalize projects
    const rawProj: any[] = raw.projects || raw.keyProjects || [];
    const projects: ProjectItem[] = rawProj.map((p: any) => ({
        name: p.name || p.title || "",
        description: p.description || p.summary || "",
        technologies: Array.isArray(p.technologies) ? p.technologies
            : Array.isArray(p.techStack) ? p.techStack
                : [],
    }));

    // Normalize education
    const rawEdu: any[] = raw.education || [];
    const education: EducationItem[] = rawEdu.map((e: any) => ({
        degree: e.degree || e.qualification || e.course || "",
        institution: e.institution || e.school || e.university || e.college || "",
        dates: e.dates || e.duration || e.year || e.period || "",
    }));

    // Normalize certifications, achievements, hobbies
    const certifications = raw.certifications || [];
    const achievements = raw.achievements || [];
    const hobbies = raw.hobbies || [];

    return {
        name: raw.name || "",
        role: raw.role || raw.title || raw.designation || raw.currentRole || "",
        location: raw.location || "",
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

    // BUG FIX 2: Multi-page PDF download
    // Old code used a single pdf.addImage() which either squishes content or cuts it off
    // when resume height exceeds one A4 page (297mm).
    // Fix: slice the canvas into A4-height chunks and add each as a new page.
    const handleDownload = async () => {
        if (!resumeRef.current) return;
        try {
            setIsDownloading(true);
            const element = resumeRef.current;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
            const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm

            // Total rendered height in mm (proportional to canvas)
            const totalHeightMm = (canvas.height * pdfWidth) / canvas.width;

            if (totalHeightMm <= pdfPageHeight) {
                // Single page — resume fits in one A4
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, totalHeightMm);
            } else {
                // Multi-page — slice canvas row by row into A4-height segments
                const pageHeightPx = Math.floor((pdfPageHeight / totalHeightMm) * canvas.height);
                let remainingHeight = canvas.height;
                let yOffset = 0;
                let isFirstPage = true;

                while (remainingHeight > 0) {
                    const sliceHeight = Math.min(pageHeightPx, remainingHeight);

                    // Create an offscreen canvas for this page slice
                    const pageCanvas = document.createElement("canvas");
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = sliceHeight;

                    const ctx = pageCanvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(
                            canvas,
                            0, yOffset,           // source x, y
                            canvas.width, sliceHeight, // source width, height
                            0, 0,                 // dest x, y
                            canvas.width, sliceHeight  // dest width, height
                        );
                    }

                    const sliceData = pageCanvas.toDataURL("image/png");
                    const sliceHeightMm = (sliceHeight * pdfWidth) / canvas.width;

                    if (!isFirstPage) pdf.addPage();
                    pdf.addImage(sliceData, "PNG", 0, 0, pdfWidth, sliceHeightMm);

                    yOffset += sliceHeight;
                    remainingHeight -= sliceHeight;
                    isFirstPage = false;
                }
            }

            pdf.save(`${data.name.replace(/\s+/g, "_")}_Resume.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCopy = () => {
        let text = `${data.name}\n${data.role}\n${data.location || ""}\n\n`;
        text += `PROFESSIONAL SUMMARY\n${data.summary}\n\n`;

        if (data.skills && data.skills.length > 0) {
            text += `TECHNICAL SKILLS\n${data.skills.join(", ")}\n\n`;
        }

        if (data.experience && data.experience.length > 0) {
            text += `PROFESSIONAL EXPERIENCE\n`;
            data.experience.forEach(exp => {
                text += `${exp.role} | ${exp.company} | ${exp.dates}\n`;
                exp.points.forEach(p => (text += `- ${p}\n`));
                text += "\n";
            });
        }

        if (data.projects && data.projects.length > 0) {
            text += `PROJECTS\n`;
            data.projects.forEach(proj => {
                text += `${proj.name}\n${proj.description}\n`;
                if (proj.technologies) {
                    text += `Technologies: ${proj.technologies.join(", ")}\n`;
                }
                text += "\n";
            });
        }

        if (data.education && data.education.length > 0) {
            text += `EDUCATION\n`;
            data.education.forEach(edu => {
                text += `${edu.degree} | ${edu.institution} | ${edu.dates}\n\n`;
            });
        }

        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl border border-gray-200/60 bg-gray-50 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 my-4">
            {/* Header / Actions Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200/60 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <span className="text-xl">📄</span> Resume Builder
                    </span>
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                        <span className="text-xs font-medium text-gray-500">Template:</span>
                        <select 
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value as any)}
                            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary/50 text-gray-700 font-medium cursor-pointer"
                        >
                            <option value="classic">Classic</option>
                            <option value="modern">Modern Data Analyst</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 transition-colors tooltip"
                        title="Copy to clipboard"
                    >
                        {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <Download size={14} />
                        {isDownloading ? "Generating PDF..." : "Download File"}
                    </button>
                </div>
            </div>

            {/* Resume Preview Container */}
            <div className="p-4 md:p-6 bg-gray-50 overflow-auto max-h-[60vh] relative">
                <div
                    ref={resumeRef}
                    className="bg-white mx-auto shadow-sm"
                    style={{
                        width: "210mm",
                        minHeight: "297mm",
                        padding: "12mm 15mm",
                        fontFamily: "'Inter', sans-serif",
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
    );
};

export default GeneratedResumeCard;