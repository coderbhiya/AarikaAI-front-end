"use client";

import React, { useState, useEffect } from "react";
import { getSkills, addSkill, updateSkill, deleteSkill } from "@/services/profileService";
import Link from "next/link";
import { Plus, Trash2, Edit3, Award, BarChart3, X, Check, FileText, UserCheck, Cpu, Wrench, Layers, BookOpen, Globe } from "lucide-react";

const GROUP_ORDER = ["Technical Skills", "Frameworks", "Tools", "Domain Skills", "Soft Skills"];

const GROUP_ICONS: Record<string, React.ReactNode> = {
  "Technical Skills": <Cpu size={14} />,
  "Frameworks":       <Layers size={14} />,
  "Tools":            <Wrench size={14} />,
  "Domain Skills":    <Globe size={14} />,
  "Soft Skills":      <BookOpen size={14} />,
};

const GROUP_COLORS: Record<string, string> = {
  "Technical Skills": "bg-blue-50 text-blue-700 border-blue-100",
  "Frameworks":       "bg-violet-50 text-violet-700 border-violet-100",
  "Tools":            "bg-amber-50 text-amber-700 border-amber-100",
  "Domain Skills":    "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Soft Skills":      "bg-pink-50 text-pink-700 border-pink-100",
};

const PROFICIENCY_OPTIONS = ["beginner", "intermediate", "expert"];

const Skills = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      try {
        const skillsData = await getSkills();
        setSkills(skillsData || []);
      } catch (err) {
        console.error("Error fetching skills:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleAddSkill = async (skillData) => {
    if (!skillData.name.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await addSkill({
        name: skillData.name.trim(),
        proficiency: skillData.proficiency || null,
      });
      if (response.success && response.skill) {
        setSkills(prev => [...prev, response.skill]);
        setIsAddingSkill(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to add skill";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSkill = async (skill) => {
    // Flip a resume-sourced skill to user_confirmed + set proficiency
    setEditingSkill({ ...skill, isConfirming: true });
  };

  const handleEditSkill = async (skillId, updatedSkill) => {
    setIsLoading(true);
    try {
      const response = await updateSkill(skillId, updatedSkill);
      if (response.success && response.skill) {
        setSkills(prev => prev.map(s => s.skillId === skillId ? { ...s, ...response.skill } : s));
        setEditingSkill(null);
      }
    } catch (err) {
      console.error("Error updating skill:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Remove this skill from your profile?")) return;
    setIsLoading(true);
    try {
      const response = await deleteSkill(skillId);
      if (response.success) {
        setSkills(prev => prev.filter(s => s.skillId !== skillId));
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Group by the `group` field returned by backend
  const groupedSkills = skills.reduce((acc, skill) => {
    const g = skill.group || "Technical Skills";
    if (!acc[g]) acc[g] = [];
    acc[g].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  // Show groups in defined order + any unexpected groups at end
  const orderedGroups = [
    ...GROUP_ORDER.filter(g => groupedSkills[g]),
    ...Object.keys(groupedSkills).filter(g => !GROUP_ORDER.includes(g))
  ];

  // ── Add/Edit Form ──────────────────────────────────────────────────────────
  const SkillForm = ({ skill = null, isConfirming = false, onSave, onCancel }: {
    skill?: any; isConfirming?: boolean; onSave: any; onCancel: any
  }) => {
    const [name, setName] = useState(skill?.name || "");
    const [proficiency, setProficiency] = useState(skill?.proficiency || "");
    const isEdit = !!skill && !isConfirming;
    const isValid = isEdit ? true : name.trim().length > 1;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isEdit || isConfirming) {
        onSave({ proficiency: proficiency || null, source: "user_confirmed" });
      } else {
        onSave({ name, proficiency: proficiency || null });
      }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 h-11 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400";

    return (
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          {!isEdit && !isConfirming && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Skill name (e.g. React, Python)"
              className={`flex-1 ${inputCls}`}
              autoFocus
            />
          )}
          {isConfirming && (
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <UserCheck size={14} className="text-blue-600 shrink-0" />
              <span className="text-sm font-semibold text-blue-700">{skill.name}</span>
              <span className="text-xs text-blue-500 ml-1">Confirming…</span>
            </div>
          )}
          <select
            value={proficiency}
            onChange={e => setProficiency(e.target.value)}
            className={`${inputCls} w-auto min-w-[160px] cursor-pointer`}
          >
            <option value="">No proficiency level</option>
            {PROFICIENCY_OPTIONS.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-11 h-11 bg-slate-900 hover:bg-primary text-white rounded-lg transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center shadow-sm"
            >
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                : <Check size={16} />
              }
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-11 h-11 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg transition-all border border-slate-200 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-2 text-xs font-medium text-red-500 ml-1">{error}</p>
        )}
      </div>
    );
  };

  const confirmedCount = skills.filter(s => s.source === "user_confirmed").length;
  const resumeCount = skills.filter(s => s.source === "resume").length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Skills</h2>
          <p className="text-gray-500 text-[12px]">Normalized · Deduplicated · Grouped</p>
        </div>
        <button
          onClick={() => { setIsAddingSkill(true); setError(null); }}
          disabled={isAddingSkill}
          className="px-4 h-9 bg-primary text-white font-bold text-[12px] rounded-full hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {/* Source Legend */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            {confirmedCount} Confirmed by you
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            {resumeCount} From resume — click to confirm
          </div>
        </div>
      )}

      {/* Add Skill Form */}
      {isAddingSkill && (
        <div className="mb-8">
          <SkillForm onSave={handleAddSkill} onCancel={() => { setIsAddingSkill(false); setError(null); }} />
        </div>
      )}

      {/* Grouped Skill List */}
      <div className="space-y-8">
        {orderedGroups.length === 0 && !isAddingSkill ? (
          <div className="p-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Award size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No skills added yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-[14px]">Add your core skills to help AI match you with the right opportunities.</p>
          </div>
        ) : (
          orderedGroups.map(group => {
            const groupSkills = groupedSkills[group] || [];
            const colorCls = GROUP_COLORS[group] || "bg-gray-50 text-gray-600 border-gray-100";
            return (
              <div key={group}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2 px-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colorCls} text-[11px] font-bold`}>
                    {GROUP_ICONS[group]}
                    {group}
                  </span>
                  <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium">{groupSkills.length}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {groupSkills.map(skill => (
                    <div key={skill.skillId}>
                      {editingSkill?.skillId === skill.skillId ? (
                        <SkillForm
                          skill={editingSkill}
                          isConfirming={editingSkill.isConfirming}
                          onSave={(updated) => handleEditSkill(skill.skillId, updated)}
                          onCancel={() => setEditingSkill(null)}
                        />
                      ) : (
                        <div className="group flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 text-[14px] font-semibold truncate">{skill.name}</span>
                              {/* Source badge */}
                              {skill.source === "resume" ? (
                                <span
                                  className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                                  onClick={() => handleConfirmSkill(skill)}
                                  title="Click to confirm this skill"
                                >
                                  <FileText size={9} /> Resume
                                </span>
                              ) : (
                                <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-600 border border-green-100">
                                  <UserCheck size={9} /> Confirmed
                                </span>
                              )}
                            </div>
                            {/* Proficiency — only shown if user confirmed */}
                            {skill.proficiency && skill.source === "user_confirmed" && (
                              <span className="text-[11px] text-gray-400 font-medium mt-0.5 capitalize">{skill.proficiency}</span>
                            )}
                            {skill.source === "resume" && !skill.proficiency && (
                              <span className="text-[10px] text-amber-500 font-medium mt-0.5">Tap badge to confirm</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {skill.skillScore === 0 && (
                              <Link
                                href={`/skill-score/detail/?skillId=${skill.skillId}`}
                                className="p-1.5 text-primary hover:bg-blue-50 rounded-lg transition-all"
                                title="Take Assessment"
                              >
                                <BarChart3 size={14} />
                              </Link>
                            )}
                            <button
                              onClick={() => setEditingSkill(skill)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.skillId)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Summary */}
      {skills.length > 0 && (
        <div className="mt-10 p-5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100">
            <BarChart3 size={20} />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-gray-900 font-bold text-sm tracking-tight mb-0.5">Skills Summary</h4>
            <p className="text-gray-500 text-[12px] leading-relaxed">
              <span className="text-primary font-bold">{skills.length} skills</span> across{" "}
              <span className="text-gray-900 font-semibold">{orderedGroups.length} groups</span> ·{" "}
              <span className="text-green-600 font-semibold">{confirmedCount} confirmed</span> ·{" "}
              <span className="text-amber-600 font-semibold">{resumeCount} from resume</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
