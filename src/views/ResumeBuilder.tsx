"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Menu, FileText, Download, Plus, Copy, Trash2, Star, Loader2, Sparkles, ChevronDown, ChevronUp, Eye, EyeOff,
  ArrowUp, ArrowDown, RefreshCw, Gauge, X, CheckCircle2, XCircle, Wand2, Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AtsResult, ResumeData, ResumeDoc, SectionKey, TemplateId, atsCheck, createResume, deleteResume,
  downloadResumePdf, importFromProfile, improveBullets, improveSummary, listResumes, previewResume,
  tailorResume, updateResume,
} from "@/services/resumeBuilderApi";

const SECTION_LABEL: Record<SectionKey, string> = {
  summary: "Summary", experience: "Experience", projects: "Projects", skills: "Skills", education: "Education",
  certifications: "Certifications", achievements: "Achievements", languages: "Languages",
};

const TEMPLATES: { id: TemplateId; name: string; note: string }[] = [
  { id: "classic", name: "Classic", note: "Centered, black & white — safest for any ATS" },
  { id: "modern", name: "Modern", note: "Accent colour, skill chips" },
  { id: "compact", name: "Compact", note: "Denser — fits more on one page" },
];
const ACCENTS = ["#1d4ed8", "#0f766e", "#7c3aed", "#be123c", "#b45309", "#111827"];

const uid = () => Math.random().toString(36).slice(2, 10);
const linesToBullets = (t: string) => t.split("\n").map((l) => l.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);

// ── small inputs ──────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-gray-600">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
    </label>
  );
}

function BulletsArea({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState(value.join("\n"));
  const last = useRef(value.join("\n"));
  useEffect(() => {
    const joined = value.join("\n");
    if (joined !== last.current) { setText(joined); last.current = joined; }
  }, [value]);
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-gray-600">Bullet points — one per line</span>
      <textarea value={text} rows={Math.max(3, text.split("\n").length + 1)} placeholder={placeholder}
        onChange={(e) => { setText(e.target.value); const b = linesToBullets(e.target.value); last.current = b.join("\n"); onChange(b); }}
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
    </label>
  );
}

function ChipEditor({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean).filter((s) => !values.includes(s));
    if (parts.length) onChange([...values, ...parts]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-white p-2">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-800 px-2.5 py-1 text-xs font-medium">
          {v}<button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}><X size={11} /></button>
        </span>
      ))}
      <input value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={add}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } else if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1)); }}
        placeholder={values.length ? "Add more…" : placeholder} className="flex-1 min-w-[120px] text-sm outline-none px-1 py-0.5" />
    </div>
  );
}

function Card({ title, children, open, onToggle, right }: { title: string; children: React.ReactNode; open: boolean; onToggle: () => void; right?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200">
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={onToggle} className="flex-1 flex items-center justify-between text-left">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {right}
      </div>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </section>
  );
}

function ItemShell({ title, onRemove, onUp, onDown, children, extra }: { title: string; onRemove: () => void; onUp?: () => void; onDown?: () => void; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3 space-y-3 bg-gray-50/40">
      <div className="flex items-center gap-1">
        <p className="flex-1 text-xs font-bold text-gray-700 truncate">{title}</p>
        {extra}
        {onUp && <button type="button" onClick={onUp} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Move up"><ArrowUp size={14} /></button>}
        {onDown && <button type="button" onClick={onDown} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Move down"><ArrowDown size={14} /></button>}
        <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600" aria-label="Remove"><Trash2 size={14} /></button>
      </div>
      {children}
    </div>
  );
}

/** Renders the resume at true A4 width (794px) and scales it to fit, so wrapping matches the PDF. */
function A4Preview({ html }: { html: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const measure = () => {
    const doc = frame.current?.contentDocument;
    if (doc?.body) setHeight(Math.max(1123, doc.documentElement.scrollHeight + 40));
  };
  return (
    <div ref={box} className="w-full max-w-[794px]">
      <div style={{ height: height * scale }} className="relative">
        <iframe
          ref={frame}
          title="Resume preview"
          srcDoc={html}
          // Same-origin only so we can measure the height; scripts stay disabled.
          sandbox="allow-same-origin"
          onLoad={measure}
          style={{ width: 794, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
          className="absolute top-0 left-0 border-0 bg-white shadow-xl"
        />
      </div>
      {height > 1123 && <p className="text-[11px] text-gray-500 mt-2 text-center">About {Math.ceil(height / 1123)} pages</p>}
    </div>
  );
}

const move = <T,>(arr: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

// ── page ──────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const { toggleSidebar } = useAuth();
  const [resumes, setResumes] = useState<ResumeDoc[]>([]);
  const [doc, setDoc] = useState<ResumeDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty" | "error">("saved");
  const [html, setHtml] = useState("");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [open, setOpen] = useState<Record<string, boolean>>({ design: false, basics: true, summary: true, experience: true });
  const [busy, setBusy] = useState<string | null>(null);
  const [atsOpen, setAtsOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [ats, setAts] = useState<AtsResult | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const previewTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    listResumes()
      .then((r) => { setResumes(r.resumes); setDoc(r.resumes[0] || null); })
      .catch(() => toast.error("Could not load your resumes"))
      .finally(() => setLoading(false));
  }, []);

  // Live preview (server-rendered: identical to the PDF).
  useEffect(() => {
    if (!doc) return;
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      previewResume(doc.data, doc.template, doc.accentColor).then((r) => setHtml(r.html)).catch(() => {});
    }, 350);
  }, [doc?.data, doc?.template, doc?.accentColor]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback((next: ResumeDoc) => {
    setSaveState("dirty");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await updateResume(next.id, { title: next.title, template: next.template, accentColor: next.accentColor, data: next.data });
        setSaveState("saved");
        setResumes((rs) => rs.map((r) => (r.id === next.id ? { ...next } : r)));
      } catch {
        setSaveState("error");
      }
    }, 1000);
  }, []);

  const patch = (p: Partial<ResumeDoc>) => {
    if (!doc) return;
    const next = { ...doc, ...p };
    setDoc(next);
    persist(next);
  };
  const setData = (fn: (d: ResumeData) => ResumeData) => doc && patch({ data: fn(doc.data) });
  const setBasics = (k: keyof ResumeData["basics"], v: string) => setData((d) => ({ ...d, basics: { ...d.basics, [k]: v } }));

  const switchTo = (id: number) => {
    const r = resumes.find((x) => x.id === id);
    if (r) { setDoc(r); setAts(null); }
  };

  const newResume = async (fromId?: number) => {
    setBusy("new");
    try {
      const r = await createResume(fromId ? { fromId, title: `${doc?.title || "Resume"} (copy)` } : { title: "New Resume" });
      setResumes((rs) => [...rs, r.resume]);
      setDoc(r.resume);
      toast.success(fromId ? "Copy created" : "New resume created from your profile");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not create resume");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!doc || resumes.length <= 1) return;
    if (!window.confirm(`Delete "${doc.title}"? This can't be undone.`)) return;
    await deleteResume(doc.id);
    const rest = resumes.filter((r) => r.id !== doc.id);
    const fresh = await listResumes().catch(() => null);
    setResumes(fresh?.resumes || rest);
    setDoc((fresh?.resumes || rest)[0] || null);
  };

  const makePrimary = async () => {
    if (!doc) return;
    await updateResume(doc.id, { isPrimary: true });
    setResumes((rs) => rs.map((r) => ({ ...r, isPrimary: r.id === doc.id })));
    setDoc({ ...doc, isPrimary: true });
    toast.success("Used for your job applications from now on");
  };

  const reimport = async () => {
    if (!doc || !window.confirm("Replace this resume's content with what's on your profile now?")) return;
    setBusy("import");
    try {
      const r = await importFromProfile();
      patch({ data: r.data });
      toast.success("Refreshed from your profile");
    } finally {
      setBusy(null);
    }
  };

  const download = async () => {
    if (!doc) return;
    setBusy("pdf");
    try {
      const name = `${(doc.data.basics.name || "Resume").replace(/[^a-z0-9]+/gi, "_")}_Resume.pdf`;
      await downloadResumePdf(doc.data, doc.template, doc.accentColor, name);
    } catch {
      toast.error("Could not generate the PDF");
    } finally {
      setBusy(null);
    }
  };

  const aiSummary = async () => {
    if (!doc) return;
    setBusy("summary");
    try {
      const r = await improveSummary(doc.data, doc.data.basics.headline);
      if (r.summary) setBasics("summary", r.summary);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "AI is busy, try again");
    } finally {
      setBusy(null);
    }
  };

  const aiBullets = async (kind: "experience" | "projects", idx: number) => {
    if (!doc) return;
    const item: any = doc.data[kind][idx];
    setBusy(`${kind}-${idx}`);
    try {
      const r = await improveBullets(doc.data, item.bullets, item.role || item.name, item.company || "");
      setData((d) => ({ ...d, [kind]: d[kind].map((x: any, i: number) => (i === idx ? { ...x, bullets: r.bullets } : x)) }));
      if (r.tips?.length) toast.message("Tip", { description: r.tips[0] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "AI is busy, try again");
    } finally {
      setBusy(null);
    }
  };

  const runAts = async () => {
    if (!doc) return;
    setBusy("ats");
    try {
      const r = await atsCheck({ data: doc.data, resumeId: doc.id, jobDescription: jd, jobTitle: jdTitle });
      setAts(r);
      setDoc((d) => (d ? { ...d, lastAtsScore: r.score } : d));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not run the check");
    } finally {
      setBusy(null);
    }
  };

  const tailor = async () => {
    if (!doc || jd.trim().length < 80) { toast.error("Paste the full job description first"); return; }
    setBusy("tailor");
    try {
      const r = await tailorResume(doc.id, { jobDescription: jd, jobTitle: jdTitle || "Target role" });
      setResumes((rs) => [...rs, r.resume]);
      setDoc(r.resume);
      setAts(null);
      toast.success("Tailored copy created — your original is unchanged");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not tailor");
    } finally {
      setBusy(null);
    }
  };

  const d = doc?.data;
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const hidden = useMemo(() => new Set(d?.hiddenSections || []), [d?.hiddenSections]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  if (!doc || !d) return <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Could not load the resume builder.</div>;

  const sectionCard = (key: SectionKey, body: React.ReactNode, addLabel?: string, onAdd?: () => void) => (
    <Card key={key} title={SECTION_LABEL[key]} open={!!open[key]} onToggle={() => toggle(key)}
      right={hidden.has(key) ? <span className="text-[10px] font-semibold text-gray-400 mr-1">hidden</span> : null}>
      {body}
      {onAdd && (
        <button type="button" onClick={onAdd} className="w-full py-2 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 inline-flex items-center justify-center gap-1">
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </Card>
  );

  const editors: Record<SectionKey, React.ReactNode> = {
    summary: sectionCard("summary", (
      <>
        <textarea value={d.basics.summary} onChange={(e) => setBasics("summary", e.target.value)} rows={4}
          placeholder="2–3 lines: who you are, what you're good at, what you want next."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        <button type="button" onClick={aiSummary} disabled={busy === "summary"} className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 disabled:opacity-50">
          {busy === "summary" ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} {d.basics.summary ? "Improve with AI" : "Write with AI"}
        </button>
      </>
    )),
    experience: sectionCard("experience", d.experience.map((e, i) => (
      <ItemShell key={e.id} title={e.role || e.company || "New role"}
        onRemove={() => setData((x) => ({ ...x, experience: x.experience.filter((_, j) => j !== i) }))}
        onUp={i > 0 ? () => setData((x) => ({ ...x, experience: move(x.experience, i, -1) })) : undefined}
        onDown={i < d.experience.length - 1 ? () => setData((x) => ({ ...x, experience: move(x.experience, i, 1) })) : undefined}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Role" value={e.role} onChange={(v) => setData((x) => ({ ...x, experience: x.experience.map((y, j) => (j === i ? { ...y, role: v } : y)) }))} />
          <Field label="Company" value={e.company} onChange={(v) => setData((x) => ({ ...x, experience: x.experience.map((y, j) => (j === i ? { ...y, company: v } : y)) }))} />
          <Field label="Start" value={e.start} placeholder="Jan 2023" onChange={(v) => setData((x) => ({ ...x, experience: x.experience.map((y, j) => (j === i ? { ...y, start: v } : y)) }))} />
          <Field label="End" value={e.current ? "Present" : e.end} placeholder="Present" onChange={(v) => setData((x) => ({ ...x, experience: x.experience.map((y, j) => (j === i ? { ...y, end: v, current: /present/i.test(v) } : y)) }))} />
          <div className="col-span-2"><Field label="Location" value={e.location} onChange={(v) => setData((x) => ({ ...x, experience: x.experience.map((y, j) => (j === i ? { ...y, location: v } : y)) }))} /></div>
        </div>
        <BulletsArea value={e.bullets} placeholder={"Built …\nReduced … by …%"} onChange={(b) => setData((x) => ({ ...x, experience: x.experience.map((y, j) => (j === i ? { ...y, bullets: b } : y)) }))} />
        <button type="button" onClick={() => aiBullets("experience", i)} disabled={!e.bullets.length || busy === `experience-${i}`} className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 disabled:opacity-40">
          {busy === `experience-${i}` ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} Improve bullets with AI
        </button>
      </ItemShell>
    )), "Add experience", () => setData((x) => ({ ...x, experience: [...x.experience, { id: uid(), role: "", company: "", location: "", start: "", end: "", current: false, bullets: [] }] }))),
    projects: sectionCard("projects", d.projects.map((p, i) => (
      <ItemShell key={p.id} title={p.name || "New project"}
        onRemove={() => setData((x) => ({ ...x, projects: x.projects.filter((_, j) => j !== i) }))}
        onUp={i > 0 ? () => setData((x) => ({ ...x, projects: move(x.projects, i, -1) })) : undefined}
        onDown={i < d.projects.length - 1 ? () => setData((x) => ({ ...x, projects: move(x.projects, i, 1) })) : undefined}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Project name" value={p.name} onChange={(v) => setData((x) => ({ ...x, projects: x.projects.map((y, j) => (j === i ? { ...y, name: v } : y)) }))} />
          <Field label="Link" value={p.link} placeholder="github.com/…" onChange={(v) => setData((x) => ({ ...x, projects: x.projects.map((y, j) => (j === i ? { ...y, link: v } : y)) }))} />
          <div className="col-span-2"><Field label="Tech used" value={p.tech} placeholder="React, Node.js, PostgreSQL" onChange={(v) => setData((x) => ({ ...x, projects: x.projects.map((y, j) => (j === i ? { ...y, tech: v } : y)) }))} /></div>
        </div>
        <BulletsArea value={p.bullets} placeholder={"What it does\nWhat you built / the result"} onChange={(b) => setData((x) => ({ ...x, projects: x.projects.map((y, j) => (j === i ? { ...y, bullets: b } : y)) }))} />
        <button type="button" onClick={() => aiBullets("projects", i)} disabled={!p.bullets.length || busy === `projects-${i}`} className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 disabled:opacity-40">
          {busy === `projects-${i}` ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} Improve bullets with AI
        </button>
      </ItemShell>
    )), "Add project", () => setData((x) => ({ ...x, projects: [...x.projects, { id: uid(), name: "", link: "", tech: "", bullets: [] }] }))),
    skills: sectionCard("skills", (
      <>
        {(d.skills.length ? d.skills : [{ name: "Skills", items: [] }]).map((g, i) => (
          <div key={i} className="space-y-1.5">
            {d.skills.length > 1 && (
              <div className="flex items-center gap-2">
                <input value={g.name} onChange={(e) => setData((x) => ({ ...x, skills: x.skills.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) }))}
                  className="flex-1 text-xs font-semibold rounded-lg border border-gray-200 px-2 py-1.5" placeholder="Group name (e.g. Languages)" />
                <button type="button" onClick={() => setData((x) => ({ ...x, skills: x.skills.filter((_, j) => j !== i) }))} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            )}
            <ChipEditor values={g.items} placeholder="Type a skill and press Enter"
              onChange={(items) => setData((x) => ({ ...x, skills: x.skills.length ? x.skills.map((y, j) => (j === i ? { ...y, items } : y)) : [{ name: "Skills", items }] }))} />
          </div>
        ))}
        <button type="button" onClick={() => setData((x) => ({ ...x, skills: [...(x.skills.length ? x.skills : [{ name: "Technical", items: [] }]), { name: "Tools", items: [] }] }))}
          className="text-xs font-semibold text-gray-600 inline-flex items-center gap-1"><Plus size={12} /> Add a skill group</button>
      </>
    )),
    education: sectionCard("education", d.education.map((e, i) => (
      <ItemShell key={e.id} title={e.degree || e.institution || "New education"}
        onRemove={() => setData((x) => ({ ...x, education: x.education.filter((_, j) => j !== i) }))}
        onUp={i > 0 ? () => setData((x) => ({ ...x, education: move(x.education, i, -1) })) : undefined}
        onDown={i < d.education.length - 1 ? () => setData((x) => ({ ...x, education: move(x.education, i, 1) })) : undefined}>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2"><Field label="Degree" value={e.degree} placeholder="B.Tech, Computer Science" onChange={(v) => setData((x) => ({ ...x, education: x.education.map((y, j) => (j === i ? { ...y, degree: v } : y)) }))} /></div>
          <div className="col-span-2"><Field label="College / School" value={e.institution} onChange={(v) => setData((x) => ({ ...x, education: x.education.map((y, j) => (j === i ? { ...y, institution: v } : y)) }))} /></div>
          <Field label="Start" value={e.start} placeholder="2020" onChange={(v) => setData((x) => ({ ...x, education: x.education.map((y, j) => (j === i ? { ...y, start: v } : y)) }))} />
          <Field label="End" value={e.end} placeholder="2024" onChange={(v) => setData((x) => ({ ...x, education: x.education.map((y, j) => (j === i ? { ...y, end: v } : y)) }))} />
          <Field label="CGPA / %" value={e.score} placeholder="8.2 CGPA" onChange={(v) => setData((x) => ({ ...x, education: x.education.map((y, j) => (j === i ? { ...y, score: v } : y)) }))} />
          <Field label="Location" value={e.location} onChange={(v) => setData((x) => ({ ...x, education: x.education.map((y, j) => (j === i ? { ...y, location: v } : y)) }))} />
        </div>
      </ItemShell>
    )), "Add education", () => setData((x) => ({ ...x, education: [...x.education, { id: uid(), degree: "", institution: "", location: "", start: "", end: "", score: "" }] }))),
    certifications: sectionCard("certifications", d.certifications.map((c, i) => (
      <ItemShell key={c.id} title={c.name || "New certification"} onRemove={() => setData((x) => ({ ...x, certifications: x.certifications.filter((_, j) => j !== i) }))}>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2"><Field label="Name" value={c.name} onChange={(v) => setData((x) => ({ ...x, certifications: x.certifications.map((y, j) => (j === i ? { ...y, name: v } : y)) }))} /></div>
          <Field label="Issuer" value={c.issuer} onChange={(v) => setData((x) => ({ ...x, certifications: x.certifications.map((y, j) => (j === i ? { ...y, issuer: v } : y)) }))} />
          <Field label="Date" value={c.date} placeholder="Mar 2024" onChange={(v) => setData((x) => ({ ...x, certifications: x.certifications.map((y, j) => (j === i ? { ...y, date: v } : y)) }))} />
        </div>
      </ItemShell>
    )), "Add certification", () => setData((x) => ({ ...x, certifications: [...x.certifications, { id: uid(), name: "", issuer: "", date: "", link: "" }] }))),
    achievements: sectionCard("achievements", (
      <BulletsArea value={d.achievements} placeholder={"Won Smart India Hackathon 2024\nRanked top 5% in …"} onChange={(b) => setData((x) => ({ ...x, achievements: b }))} />
    )),
    languages: sectionCard("languages", (
      <ChipEditor values={d.languages} placeholder="English (Fluent), Hindi (Native)" onChange={(v) => setData((x) => ({ ...x, languages: v }))} />
    )),
  };

  const saveLabel = { saved: "Saved", saving: "Saving…", dirty: "Unsaved", error: "Save failed — retrying on next edit" }[saveState];

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F8FAFC] overflow-hidden">
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-2 px-3 md:px-6 py-2.5 bg-white border-b border-gray-200">
        <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Toggle Sidebar"><Menu className="w-5 h-5" /></button>
        <FileText className="w-5 h-5 text-primary hidden sm:block" />
        <select value={doc.id} onChange={(e) => switchTo(Number(e.target.value))} className="max-w-[180px] sm:max-w-[260px] text-sm font-semibold rounded-lg border border-gray-200 px-2 py-1.5 bg-white">
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.isPrimary ? "★ " : ""}{r.title}</option>)}
        </select>
        <span className={`text-[11px] font-medium ${saveState === "error" ? "text-red-500" : "text-gray-400"} inline-flex items-center gap-1`}>
          {saveState === "saving" ? <Loader2 size={11} className="animate-spin" /> : saveState === "saved" ? <Check size={11} /> : null}{saveLabel}
        </span>
        <div className="flex-1" />
        <button onClick={() => setAtsOpen(true)} className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-gray-700 inline-flex items-center gap-1.5">
          <Gauge size={13} /> ATS check{doc.lastAtsScore != null ? ` · ${doc.lastAtsScore}%` : ""}
        </button>
        <button onClick={download} disabled={busy === "pdf"} className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-60">
          {busy === "pdf" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} PDF
        </button>
      </header>

      {/* Mobile toggle */}
      <div className="md:hidden flex border-b border-gray-200 bg-white">
        {(["edit", "preview"] as const).map((v) => (
          <button key={v} onClick={() => setMobileView(v)} className={`flex-1 py-2 text-sm font-semibold border-b-2 ${mobileView === v ? "border-primary text-primary" : "border-transparent text-gray-500"}`}>
            {v === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`${mobileView === "edit" ? "flex" : "hidden"} md:flex flex-col w-full md:w-[460px] lg:w-[520px] shrink-0 overflow-y-auto border-r border-gray-200 p-3 sm:p-4 space-y-3`}>
          {/* Resume actions */}
          <div className="flex flex-wrap gap-2 text-xs">
            {!doc.isPrimary ? (
              <button onClick={makePrimary} className="px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 font-semibold inline-flex items-center gap-1"><Star size={12} /> Use for applications</button>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 font-semibold inline-flex items-center gap-1"><Star size={12} fill="currentColor" /> Used for applications</span>
            )}
            <button onClick={() => newResume()} disabled={busy === "new"} className="px-3 py-1.5 rounded-full border border-gray-200 bg-white font-semibold text-gray-700 inline-flex items-center gap-1"><Plus size={12} /> New</button>
            <button onClick={() => newResume(doc.id)} disabled={busy === "new"} className="px-3 py-1.5 rounded-full border border-gray-200 bg-white font-semibold text-gray-700 inline-flex items-center gap-1"><Copy size={12} /> Duplicate</button>
            <button onClick={reimport} disabled={busy === "import"} className="px-3 py-1.5 rounded-full border border-gray-200 bg-white font-semibold text-gray-700 inline-flex items-center gap-1">
              {busy === "import" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} From profile
            </button>
            {resumes.length > 1 && <button onClick={remove} className="px-3 py-1.5 rounded-full border border-gray-200 bg-white font-semibold text-red-600 inline-flex items-center gap-1"><Trash2 size={12} /> Delete</button>}
          </div>
          {doc.targetJobTitle && <p className="text-[11px] text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">Tailored for: <b>{doc.targetJobTitle}</b></p>}

          <Card title="Design" open={!!open.design} onToggle={() => toggle("design")}>
            <Field label="Resume name (only you see this)" value={doc.title} onChange={(v) => patch({ title: v })} />
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} type="button" onClick={() => patch({ template: t.id })}
                  className={`rounded-xl border p-2.5 text-left ${doc.template === t.id ? "border-indigo-500 ring-2 ring-indigo-100" : "border-gray-200"}`}>
                  <p className="text-xs font-bold text-gray-900">{t.name}</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{t.note}</p>
                </button>
              ))}
            </div>
            {doc.template !== "classic" && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-600">Accent</span>
                {ACCENTS.map((c) => (
                  <button key={c} type="button" onClick={() => patch({ accentColor: c })} aria-label={`Accent ${c}`}
                    className={`w-6 h-6 rounded-full border-2 ${doc.accentColor === c ? "border-gray-900" : "border-white shadow"}`} style={{ background: c }} />
                ))}
              </div>
            )}
          </Card>

          <Card title="Contact details" open={!!open.basics} onToggle={() => toggle("basics")}>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2"><Field label="Full name" value={d.basics.name} onChange={(v) => setBasics("name", v)} /></div>
              <div className="col-span-2"><Field label="Headline" value={d.basics.headline} placeholder="Frontend Developer | React, TypeScript" onChange={(v) => setBasics("headline", v)} /></div>
              <Field label="Email" type="email" value={d.basics.email} onChange={(v) => setBasics("email", v)} />
              <Field label="Phone" value={d.basics.phone} onChange={(v) => setBasics("phone", v)} />
              <Field label="City" value={d.basics.location} placeholder="Bengaluru" onChange={(v) => setBasics("location", v)} />
              <Field label="LinkedIn" value={d.basics.linkedin} placeholder="linkedin.com/in/…" onChange={(v) => setBasics("linkedin", v)} />
              <Field label="GitHub" value={d.basics.github} onChange={(v) => setBasics("github", v)} />
              <Field label="Portfolio" value={d.basics.website} onChange={(v) => setBasics("website", v)} />
            </div>
          </Card>

          {d.sectionOrder.map((k) => editors[k])}

          <Card title="Section order & visibility" open={!!open.order} onToggle={() => toggle("order")}>
            <ul className="space-y-1">
              {d.sectionOrder.map((k, i) => (
                <li key={k} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-1.5">
                  <span className={`flex-1 text-sm ${hidden.has(k) ? "text-gray-400 line-through" : "text-gray-800"}`}>{SECTION_LABEL[k]}</span>
                  <button type="button" onClick={() => setData((x) => ({ ...x, hiddenSections: hidden.has(k) ? x.hiddenSections.filter((h) => h !== k) : [...x.hiddenSections, k] }))} className="p-1 text-gray-400 hover:text-gray-700" aria-label={hidden.has(k) ? "Show" : "Hide"}>
                    {hidden.has(k) ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button type="button" disabled={i === 0} onClick={() => setData((x) => ({ ...x, sectionOrder: move(x.sectionOrder, i, -1) }))} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ArrowUp size={14} /></button>
                  <button type="button" disabled={i === d.sectionOrder.length - 1} onClick={() => setData((x) => ({ ...x, sectionOrder: move(x.sectionOrder, i, 1) }))} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ArrowDown size={14} /></button>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-gray-500">Empty sections are left out of the PDF automatically.</p>
          </Card>
          <div className="h-6" />
        </div>

        {/* Preview */}
        <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-1 overflow-auto bg-gray-100 justify-center items-start p-3 sm:p-6`}>
          {html ? <A4Preview html={html} /> : <div className="flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>}
        </div>
      </div>

      {/* ATS drawer */}
      {atsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setAtsOpen(false)}>
          <div className="w-full sm:max-w-[520px] h-full bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide inline-flex items-center gap-1"><Sparkles size={12} /> ATS check</p>
                <h3 className="text-base font-bold text-gray-900">Will recruiters&apos; software read this well?</h3>
              </div>
              <button onClick={() => setAtsOpen(false)} className="p-2 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Field label="Job title (optional)" value={jdTitle} onChange={setJdTitle} placeholder="e.g. Data Analyst" />
              <label className="block">
                <span className="text-[11px] font-semibold text-gray-600">Paste a job description (optional) — to check keywords for that job</span>
                <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-y" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button onClick={runAts} disabled={busy === "ats"} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-60">
                  {busy === "ats" ? <Loader2 size={13} className="animate-spin" /> : <Gauge size={13} />} Check score
                </button>
                <button onClick={tailor} disabled={busy === "tailor" || jd.trim().length < 80} className="px-4 py-2 rounded-full border border-indigo-300 text-indigo-700 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40" title="Creates a tailored copy; your original stays as is">
                  {busy === "tailor" ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} Tailor a copy for this job
                </button>
              </div>

              {ats && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                    <p className={`text-4xl font-bold ${ats.score >= 75 ? "text-emerald-600" : ats.score >= 55 ? "text-amber-600" : "text-red-500"}`}>{ats.score}</p>
                    <p className="text-sm text-gray-600">
                      {ats.score >= 75 ? "Strong — ATS-friendly and well matched." : ats.score >= 55 ? "Decent — fix the items below to stand out." : "Needs work — start with the red items."}
                    </p>
                  </div>
                  {ats.keywords && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-900">Job keywords ({ats.keywords.score}% covered)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ats.keywords.matched.map((k) => <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{k}</span>)}
                        {ats.keywords.missingRequired.map((k) => <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">{k}</span>)}
                        {ats.keywords.missingPreferred.map((k) => <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">{k}</span>)}
                      </div>
                      <p className="text-[11px] text-gray-500">Red = required and missing. Add them only if you genuinely have the skill.</p>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {ats.structure.checks.map((c) => (
                      <li key={c.id} className="flex gap-2 text-sm">
                        {c.pass ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
                        <div>
                          <p className={c.pass ? "text-gray-700" : "text-gray-900 font-medium"}>{c.label}</p>
                          {!c.pass && <p className="text-xs text-gray-500">{c.fix}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
