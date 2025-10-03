import React, { useState, useEffect } from "react";
import { getSkills, addSkill, updateSkill, deleteSkill } from "@/services/profileService";
import { Link } from "react-router-dom";

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const skillCategories = ["Programming Languages", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "Design & UI/UX", "Project Management", "Soft Skills", "Other"];

  // Fetch skills when component mounts
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

  // ✅ Fixed: accept skillData directly (no state issue)
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

  // ✅ Edit skill also takes data directly
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

  const SkillForm = ({ skill, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: skill?.name || "",
      category: skill?.category || "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.name.trim() && formData.category) {
        onSave(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 p-3 rounded-lg border-2 border-dashed bg-gray-800 border-gray-600`}>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Skill name"
          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-600 bg-gray-700 text-white placeholder-gray-400`}
          autoFocus
        />
        <select value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} className={`flex-1 sm:flex-none sm:w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-600 bg-gray-700 text-white`}>
          <option value="">Select category</option>
          {skillCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="flex space-x-2">
          <button type="submit" disabled={isLoading || !formData.name.trim() || !formData.category} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isLoading ? "..." : "✓"}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
            ✕
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold mb-2 text-white`}>Skills & Expertise</h2>
          <p className={`text-sm sm:text-base text-gray-300`}>Manage your technical and professional skills</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button onClick={() => setIsAddingSkill(true)} disabled={isAddingSkill} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span className="mr-2">➕</span>
            Add Skill
          </button>
        </div>
      </div>

      {/* Add Skill Form */}
      {isAddingSkill && (
        <div className="mb-6">
          <SkillForm onSave={(skillData) => handleAddSkill(skillData)} onCancel={() => setIsAddingSkill(false)} />
        </div>
      )}

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-800`}>
              <span className="text-2xl text-gray-400">🛠️</span>
            </div>
            <h3 className={`text-lg font-medium mb-2 text-white`}>No skills added yet</h3>
            <p className={`mb-4 text-gray-400`}>Start building your skill profile by adding your expertise</p>
            <button onClick={() => setIsAddingSkill(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <span className="mr-2">➕</span>
              Add Your First Skill
            </button>
          </div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className={`rounded-lg p-4 sm:p-6 bg-gray-800 border border-gray-700`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center text-white`}>
                <span className="mr-2">📂</span>
                {category}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300`}>{categorySkills.length}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categorySkills.map((skill, index) => (
                  <div key={index}>
                    {editingSkill === skill.id ? (
                      <SkillForm skill={skill} onSave={(updatedSkill) => handleEditSkill(skill.skillId, updatedSkill)} onCancel={() => setEditingSkill(null)} />
                    ) : (
                      <div className={`group flex items-center justify-between p-3 rounded-lg border transition-colors bg-gray-700 border-gray-600 hover:border-gray-500`}>
                        <span className={`font-medium truncate text-gray-200`}>
                          {skill.name} (<span className={`text-sm ${skill.skillScore === 0 ? 'text-red-400' : 'text-green-400'}`}>Score: {skill.skillScore}</span>)
                        </span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {skill.skillScore == 0 && (
                            <Link to={`/skill-score/${skill.skillId}`} className={`p-1 transition-colors text-gray-400 hover:text-blue-400`} title="Add skill score">
                              Add Score
                            </Link>
                          )}
                          <button onClick={() => setEditingSkill(skill.skillId)} className={`p-1 transition-colors text-gray-400 hover:text-blue-400`} title="Edit skill">
                            ✏️
                          </button>
                          <button onClick={() => handleDeleteSkill(skill.skillId)} className={`p-1 transition-colors text-gray-400 hover:text-red-400`} title="Delete skill">
                            🗑️
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

      {/* Skills Summary */}
      {skills.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600 text-lg">📊</span>
            <h4 className="font-semibold text-blue-900">Skills Summary</h4>
          </div>
          <p className="text-blue-800 text-sm">
            You have <strong>{skills.length}</strong> skills across <strong>{Object.keys(groupedSkills).length}</strong> categories. Keep adding skills to showcase your expertise!
          </p>
        </div>
      )}
    </div>
  );
};

export default Skills;
