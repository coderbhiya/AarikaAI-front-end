"use client";

import React, { useState, useEffect } from "react";
import { getSkills, addSkill, updateSkill, deleteSkill } from "@/services/profileService";
import Link from "next/link";
import { Plus, Trash2, Edit3, Folder, Target, Award, BarChart3, X, Check } from "lucide-react";

const Skills = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const skillCategories = ["Programming Languages", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "Design & UI/UX", "Project Management", "Soft Skills", "Other"];

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      try {
        const skillsData = await getSkills();
        setSkills(skillsData || []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleAddSkill = async (skillData) => {
    if (!skillData.name.trim() || !skillData.category) return;

    setIsLoading(true);
    try {
      const response = await addSkill({
        name: skillData.name.trim(),
        category: skillData.category,
        proficiency: "beginner",
      });

      if (response.success && response.skill) {
        setSkills((prev) => [...prev, response.skill]);
        setIsAddingSkill(false);
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSkill = async (skillId, updatedSkill) => {
    if (!updatedSkill.name.trim() || !updatedSkill.category) return;

    setIsLoading(true);
    try {
      const response = await updateSkill(skillId, updatedSkill);

      if (response.success && response.skill) {
        setSkills((prev) => prev.map((skill) => (skill.id === skillId ? response.skill : skill)));
        setEditingSkill(null);
      }
    } catch (error) {
      console.error("Error updating skill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;

    setIsLoading(true);
    try {
      const response = await deleteSkill(skillId);

      if (response.success) {
        setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const SkillForm = ({ skill = null, onSave, onCancel }: { skill?: any; onSave: any; onCancel: any }) => {
    const [formData, setFormData] = useState({
      name: skill?.name || "",
      category: skill?.category || "",
    });

    const isFormValid = formData.name.trim() && formData.category;

    return (
      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-lg animate-in zoom-in-95 duration-200">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Skill (e.g. React)"
            className="flex-1 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg px-4 h-11 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400"
            autoFocus
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="flex-1 sm:w-64 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-lg px-4 h-11 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium appearance-none cursor-pointer"
          >
            <option value="" className="bg-white text-slate-400">Select Category</option>
            {skillCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-white">{cat}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => onSave(formData)}
              disabled={isLoading || !isFormValid}
              className="w-11 h-11 bg-slate-900 hover:bg-primary text-white rounded-lg transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center shadow-sm"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
            </button>
            <button
              onClick={onCancel}
              className="w-11 h-11 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg transition-all border border-slate-200 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Skills</h2>
          <p className="text-gray-500 text-[12px]">Showcase your professional competencies and expertise</p>
        </div>
        <button
          onClick={() => setIsAddingSkill(true)}
          disabled={isAddingSkill}
          className="px-4 h-9 bg-primary text-white font-bold text-[12px] rounded-full hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {/* Add Skill Form Area */}
      {isAddingSkill && (
        <div className="mb-10">
          <SkillForm onSave={handleAddSkill} onCancel={() => setIsAddingSkill(false)} />
        </div>
      )}

      {/* Category List */}
      <div className="space-y-10">
        {Object.keys(groupedSkills).length === 0 && !isAddingSkill ? (
          <div className="p-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Award size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No skills added yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-[14px]">Add your core skills to help recruiters and AI find the best matches for you.</p>
          </div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]: [string, any]) => (
            <div key={category}>
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2 px-1">
                <Folder size={14} className="text-gray-400" />
                {category}
                <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium">{categorySkills.length}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categorySkills.map((skill) => (
                  <div key={skill.skillId}>
                    {editingSkill === skill.skillId ? (
                      <SkillForm skill={skill} onSave={(updated) => handleEditSkill(skill.skillId, updated)} onCancel={() => setEditingSkill(null)} />
                    ) : (
                      <div className="group flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all">
                        <div className="flex flex-col">
                          <span className="text-gray-900 text-[15px] font-semibold">{skill.name}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Check size={12} className={skill.skillScore > 0 ? "text-blue-500" : "text-gray-300"} />
                            <span className={`text-[12px] font-medium ${skill.skillScore > 0 ? "text-blue-600" : "text-gray-400"}`}>
                              Proficiency: {skill.skillScore || '0'}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {skill.skillScore === 0 && (
                            <Link
                              href={`/skill-score/detail/?skillId=${skill.skillId}`}
                              className="p-1.5 text-primary hover:bg-blue-50 rounded-lg transition-all"
                              title="Take Assessment"
                            >
                              <BarChart3 size={16} />
                            </Link>
                          )}
                          <button
                            onClick={() => setEditingSkill(skill.skillId)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.skillId)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Summary */}
      {skills.length > 0 && (
        <div className="mt-12 p-6 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100">
            <BarChart3 size={24} />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-tight mb-0.5">Skills Summary</h4>
            <p className="text-gray-500 text-[13px] leading-relaxed">
              You've listed <span className="text-primary font-bold">{skills.length} skills</span> across <span className="text-gray-900 font-semibold">{Object.keys(groupedSkills).length} categories</span>. Your profile is optimized for career matching.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
