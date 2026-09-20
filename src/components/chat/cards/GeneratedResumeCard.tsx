import React, { useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Download, Copy, Check, X, Sparkles } from "lucide-react";
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
        name: raw.name || "Your Name",
        role: raw.role || raw.title || raw.designation || raw.currentRole || "",
        location: raw.location || "",
        email: raw.email || raw.emailAddress || "",
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

interface GeneratedResumeCardProps {
    data: any;
    /**
     * "card" (default): a small clickable preview card that opens its own
     * fullscreen modal on click — used for the inline chat-message rendering.
     * "inline": renders the full editor (template picker + preview) directly,
     * filling its container — used inside ChatArea's split workspace panel
     * so the resume is visible side-by-side with the chat, Claude-style,
     * without an extra click or a modal on top of the modal.
     */
    mode?: "card" | "inline";
    /**
     * When provided (mode="card"), clicking the card calls this instead of
     * opening the internal fullscreen modal — used to open the split
     * workspace panel (ChatArea's activeArtifact) instead.
     */
    onOpenWorkspace?: () => void;
}

const GeneratedResumeCard: React.FC<GeneratedResumeCardProps> = ({ data: rawData, mode = "card", onOpenWorkspace }) => {
    const data = normalizeResumeData(rawData);

    // When the underlying profile has nothing to show, the page renders as
    // an almost-blank sheet with just a name — indistinguishable from a
    // rendering bug. Surface it explicitly instead of staying silent.
    const isMostlyEmpty = !data.summary && data.skills.length === 0 && data.experience.length === 0 && data.projects.length === 0 && data.education.length === 0;

    const resumeRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern'>('classic');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auto-fit scaling for the resume page: the page has a fixed A4 width
    // (210mm ≈ 794px), which is wider than most split-panel/workspace
    // widths — without this it gets clipped on the right instead of shrinking
    // to fit, the way Google Docs / Canva scale a page preview to its container.
    //
    // The scale is applied directly to the resumeRef element's own transform
    // (not a wrapper), and measurement uses scrollWidth/scrollHeight — both
    // layout-based and unaffected by the element's own `transform`, so this
    // can't feed back into itself. handleDownload neutralizes the transform
    // before capturing so the exported PDF is always full, natural resolution
    // regardless of how small the on-screen preview is currently scaled to.
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [pageScale, setPageScale] = useState(1);
    const [pageNaturalSize, setPageNaturalSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const container = previewContainerRef.current;
        const page = resumeRef.current;
        if (!container || !page) return;

        const PAGE_PADDING = 32; // breathing room around the page inside the scroll area

        // Guard against the classic ResizeObserver + setState infinite loop:
        // only commit new state when the values actually changed (by more
        // than a px of float jitter). Without this, calling setState with a
        // freshly-created { width, height } object on every observer tick —
        // even with identical numbers — still re-renders (objects don't
        // compare equal by reference), which can re-trigger the observer and
        // loop forever ("Maximum update depth exceeded").
        let lastNaturalWidth = -1;
        let lastNaturalHeight = -1;
        let lastScale = -1;
        let rafId: number | null = null;

        const applyMeasurement = () => {
            rafId = null;
            const naturalWidth = page.scrollWidth;
            const naturalHeight = page.scrollHeight;
            if (naturalWidth === 0) return;

            const availableWidth = container.clientWidth - PAGE_PADDING;
            const rawScale = availableWidth / naturalWidth;
            const nextScale = rawScale > 0 ? Math.min(1, rawScale) : 1;

            const sizeChanged = Math.abs(naturalWidth - lastNaturalWidth) > 1 || Math.abs(naturalHeight - lastNaturalHeight) > 1;
            const scaleChanged = Math.abs(nextScale - lastScale) > 0.005;
            if (!sizeChanged && !scaleChanged) return;

            lastNaturalWidth = naturalWidth;
            lastNaturalHeight = naturalHeight;
            lastScale = nextScale;

            if (sizeChanged) setPageNaturalSize({ width: naturalWidth, height: naturalHeight });
            if (scaleChanged) setPageScale(nextScale);
        };

        // Reserving a scaled height for the page can flip an ancestor's
        // scrollbar on/off, which changes this container's own clientWidth,
        // which would change the computed scale again — a same-tick
        // ResizeObserver→setState→resize loop, which is exactly what
        // "Maximum update depth exceeded" is. Deferring the actual
        // measurement to the next animation frame breaks that synchronous
        // cascade (this is the standard fix for ResizeObserver-driven state).
        const recalc = () => {
            if (rafId != null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(applyMeasurement);
        };

        recalc();

        const resizeObserver = new ResizeObserver(recalc);
        resizeObserver.observe(container);
        return () => {
            resizeObserver.disconnect();
            if (rafId != null) cancelAnimationFrame(rafId);
        };
    }, [selectedTemplate, data, mode]);

    const handleDownload = async () => {
        if (!resumeRef.current) {
            // Compact card view: the resume page isn't mounted yet (nothing to
            // capture), so open the editor first — same as clicking the card.
            if (onOpenWorkspace) onOpenWorkspace(); else setIsModalOpen(true);
            return;
        }
        try {
            setIsDownloading(true);
            const element = resumeRef.current;

            // The on-screen preview may be visually shrunk (pageScale) to fit
            // the available width. Neutralize that before capturing so the
            // exported PDF is always full, natural resolution regardless of
            // how small it currently looks on screen.
            const previousTransform = element.style.transform;
            element.style.transform = "none";

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 800,
            });

            element.style.transform = previousTransform;

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

    // ── INLINE MODE: rendered directly inside ChatArea's split workspace
    // panel — no card, no modal chrome, just the page itself filling its
    // container, Claude-artifact-style. Actions are a small floating toolbar
    // over the preview rather than a dedicated control sidebar.
    if (mode === "inline") {
        return (
            <div className="flex w-full">
                {/* Resume Preview — auto-scaled to fit the available width so the
                    page is never clipped, the way Google Docs/Canva fit a page
                    preview to its container. The outer split panel scrolls. */}
                {/* min-w-0 is load-bearing: without it, a flex item defaults to
                    min-width:auto and won't shrink below its content's natural
                    size, which here is the full-width (unscaled) resume — that
                    would make this container's own measured width depend on
                    its child, creating a measure→resize→remeasure loop with
                    the ResizeObserver below ("Maximum update depth exceeded"). */}
                <div
                    ref={previewContainerRef}
                    className="relative flex-1 min-w-0 bg-gradient-to-b from-slate-100 to-slate-200/70 p-4 md:p-8 flex flex-col items-center gap-4"
                >
                    {/* Floating action toolbar — download / copy text */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            title={isDownloading ? "Generating..." : "Download PDF"}
                            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 active:scale-95"
                        >
                            <Download size={15} />
                        </button>
                        <button
                            onClick={handleCopy}
                            title={isCopied ? "Copied!" : "Copy Text"}
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors active:scale-95"
                        >
                            {isCopied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                        </button>
                    </div>

                    {isMostlyEmpty && (
                        <div className="w-full max-w-[210mm] px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12.5px] leading-relaxed">
                            This resume looks empty because your profile has no summary, skills, experience, projects or education added yet. Fill those in on your Profile page and regenerate for a complete resume.
                        </div>
                    )}
                    {/* overflow-hidden: resumeRef's own layout box stays at its
                        full natural width (CSS transform only affects paint,
                        not layout), so without clipping it here, the oversized
                        child would bleed out and defeat the min-w-0 above. */}
                    <div
                        className="overflow-hidden"
                        style={
                            pageNaturalSize.width
                                ? { width: pageNaturalSize.width * pageScale, height: pageNaturalSize.height * pageScale }
                                : undefined
                        }
                    >
                        <div
                            ref={resumeRef}
                            className="bg-white shadow-[0_10px_40px_rgba(15,23,42,0.15)] ring-1 ring-black/5 rounded-sm"
                            style={{
                                width: "210mm",
                                minHeight: "297mm",
                                padding: "16mm 20mm",
                                boxSizing: "border-box",
                                fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
                                transform: `scale(${pageScale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            {selectedTemplate === 'classic' ? (
                                <TemplateClassic data={data} />
                            ) : (
                                <TemplateModern data={data} />
                            )}
                        </div>
                    </div>

                    {pageScale < 1 && (
                        <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-gray-900/70 text-white text-[10px] font-semibold tracking-wide backdrop-blur-sm select-none">
                            {Math.round(pageScale * 100)}% fit
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* CARD TRIGGER - Initial View — a single compact row (icon, title,
                subtitle, Download button), Claude-artifact-card style, instead
                of a multi-section preview card. */}
            <div className="w-full max-w-md my-4">
                <div
                    onClick={() => onOpenWorkspace ? onOpenWorkspace() : setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200 px-4 py-3 group"
                >
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {data.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Document · PDF</p>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                        disabled={isDownloading}
                        className="shrink-0 px-3.5 py-2 text-xs font-semibold rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 active:scale-95"
                    >
                        {isDownloading ? "..." : "Download"}
                    </button>
                </div>
            </div>

            {/* MODAL - 2-Part Layout */}
            {/* Rendered via portal so this fixed overlay covers the whole
                viewport instead of being clipped by ancestor overflow-hidden
                containers (chat scroll area, main layout), which previously
                made it render "under" the sidebar/header instead of truly fullscreen. */}
            {isModalOpen && createPortal(
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

                        {/* RIGHT SIDE - Resume Preview — auto-scaled to fit, same as inline mode.
                            min-w-0 + overflow-hidden on the wrapper below: see the comment
                            on the inline-mode version of this container for why both are
                            required to avoid a ResizeObserver feedback loop. */}
                        <div
                            ref={previewContainerRef}
                            className="relative flex-1 min-w-0 bg-gradient-to-b from-slate-100 to-slate-200/70 p-4 md:p-6 pt-20 md:pt-16 overflow-auto flex justify-center"
                        >
                            <div
                                className="overflow-hidden"
                                style={
                                    pageNaturalSize.width
                                        ? { width: pageNaturalSize.width * pageScale, height: pageNaturalSize.height * pageScale }
                                        : undefined
                                }
                            >
                                <div
                                    ref={resumeRef}
                                    className="bg-white shadow-[0_10px_40px_rgba(15,23,42,0.15)] ring-1 ring-black/5 rounded-sm"
                                    style={{
                                        width: "210mm",
                                        minHeight: "297mm",
                                        padding: "16mm 20mm",
                                        boxSizing: "border-box",
                                        fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
                                        transform: `scale(${pageScale})`,
                                        transformOrigin: "top left",
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

                            {pageScale < 1 && (
                                <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-gray-900/70 text-white text-[10px] font-semibold tracking-wide backdrop-blur-sm select-none">
                                    {Math.round(pageScale * 100)}% fit
                                </span>
                            )}
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
                </div>,
                document.body
            )}
        </>
    );
};

export default GeneratedResumeCard;