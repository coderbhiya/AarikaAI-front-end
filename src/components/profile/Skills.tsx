import React, { useState, useEffect } from "react";
import { getSkills, addSkill, updateSkill, deleteSkill } from "@/services/profileService";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit3, Folder, Target, Award, BarChart3, X, Check } from "lucide-react";

const Skills = () => {
  const [skills, setSkills] = useState([]);
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
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Skill name (e.g. React)"
            className="flex-1 bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 transition-all text-sm"
            autoFocus
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="flex-1 sm:w-64 bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="" className="bg-zinc-900">Select Category</option>
            {skillCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => onSave(formData)}
              disabled={isLoading || !isFormValid}
              className="p-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={20} />}
            </button>
            <button
              onClick={onCancel}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 sm:p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Skills & Expertise</h2>
          <p className="text-gray-400 font-medium">Showcase your technical powers and soft skills.</p>
        </div>
        <button
          onClick={() => setIsAddingSkill(true)}
          disabled={isAddingSkill}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <Plus size={18} /> Add Skill
        </button>
      </div>

      {/* Add Skill Form Area */}
      {isAddingSkill && (
        <div className="mb-12">
          <SkillForm onSave={handleAddSkill} onCancel={() => setIsAddingSkill(false)} />
        </div>
      )}

      {/* Category List */}
      <div className="space-y-12">
        {Object.keys(groupedSkills).length === 0 && !isAddingSkill ? (
          <div className="p-20 text-center glass-card rounded-[2rem]">
            <Award size={48} className="mx-auto text-gray-700 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No skills indexed yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Build your professional profile by indexing your core competencies.</p>
          </div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]: [string, any]) => (
            <div key={category} className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 border-l-2 border-primary pl-4 flex items-center gap-3">
                <Folder size={14} className="text-primary" />
                {category}
                <span className="text-[10px] bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.05]">{categorySkills.length}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => (
                  <div key={skill.skillId}>
                    {editingSkill === skill.skillId ? (
                      <SkillForm skill={skill} onSave={(updated) => handleEditSkill(skill.skillId, updated)} onCancel={() => setEditingSkill(null)} />
                    ) : (
                      <div className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/30 transition-all hover:bg-white/[0.04]">
                        <div className="flex flex-col">
                          <span className="text-white font-bold tracking-tight">{skill.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Target size={10} className={skill.skillScore > 0 ? "text-primary" : "text-gray-600"} />
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${skill.skillScore > 0 ? "text-primary/70" : "text-gray-600"}`}>
                              Score: {skill.skillScore || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          {skill.skillScore === 0 && (
                            <Link
                              to={`/skill-score/${skill.skillId}`}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Calibrate skill score"
                            >
                              <BarChart3 size={16} />
                            </Link>
                          )}
                          <button
                            onClick={() => setEditingSkill(skill.skillId)}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.skillId)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
        <div className="mt-16 p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <BarChart3 size={32} />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Expertise Coverage</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              You've documented <span className="text-primary font-bold">{skills.length} skills</span> across <span className="text-primary font-bold">{Object.keys(groupedSkills).length} sectors</span>. Your profile depth is increasing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
