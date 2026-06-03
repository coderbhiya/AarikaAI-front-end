import React, { useState, useEffect } from 'react';
import { getProjects, addProject, updateProject, deleteProject } from '@/services/profileService';
import { FolderGit2, Plus, Trash2, Edit3, X, Check, ExternalLink, Award, Code } from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projectsData = await getProjects();
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = async (projectData: any) => {
    setIsLoading(true);
    try {
      const response = await addProject(projectData);

      if (response.success && response.project) {
        setProjects(prev => [response.project, ...prev]);
        setIsAddingProject(false);
      }
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = async (projectId: number, updatedProject: any) => {
    setIsLoading(true);
    try {
      const response = await updateProject(projectId, updatedProject);

      if (response.success && response.project) {
        setProjects(prev => prev.map(proj =>
          proj.id === projectId ? response.project : proj
        ));
        setEditingProject(null);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setIsLoading(true);
    try {
      const response = await deleteProject(projectId);

      if (response.success) {
        setProjects(prev => prev.filter(proj => proj.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ProjectForm = ({ project = null, onSave, onCancel }: { project?: any; onSave: any; onCancel: any }) => {
    const [formData, setFormData] = useState({
      name: project?.name || '',
      role: project?.role || 'Creator',
      description: project?.description || '',
      technologies: project?.technologies || '',
      link: project?.link || '',
      outcome: project?.outcome || ''
    });

    const isFormValid = formData.name.trim() && formData.role.trim();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isFormValid) {
        onSave(formData);
      }
    };

    const inputClasses = `w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium placeholder:text-slate-400 h-11`;

    return (
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Resume Analyzer Tool, Green Earth Campaign"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Role *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: Creator, Lead Developer, Organizer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Technologies / Tools Used</label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: React, Node.js, Canva, Google Forms"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700 ml-1">Project Link</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                className={inputClasses}
                placeholder="Ex: https://github.com/username/project"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`${inputClasses} resize-none h-24 pt-3`}
              placeholder="Describe what you built, the objective, and your contribution..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-700 ml-1">Outcome & Key Impact</label>
            <textarea
              value={formData.outcome}
              onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
              rows={3}
              className={`${inputClasses} resize-none h-24 pt-3`}
              placeholder="What was the result? (e.g. 50+ users, saved 10 hrs/week, raised $500)"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className="flex-1 h-11 bg-slate-900 text-white font-bold text-sm rounded-lg shadow-sm hover:bg-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              <span>{project ? 'Save Changes' : 'Add Project'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 h-11 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Self-Projects</h2>
          <p className="text-gray-500 text-[13px]">Personal, self-initiated, technical, or non-technical projects</p>
        </div>
        <button
          onClick={() => setIsAddingProject(true)}
          disabled={isAddingProject}
          className="px-5 py-2 bg-primary text-white font-semibold text-[14px] rounded-full hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Add Project
        </button>
      </div>

      {/* Add Section */}
      {isAddingProject && (
        <div className="mb-8">
          <ProjectForm onSave={handleAddProject} onCancel={() => setIsAddingProject(false)} />
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4 relative">
        {projects.length === 0 && !isAddingProject ? (
          <div className="p-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <FolderGit2 size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No projects listed yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-[13px]">Showcase your hands-on building experience, both technical and non-technical.</p>
          </div>
        ) : (
          projects.map((project: any) => (
            <div key={project.id} className="relative">
              {editingProject === project.id ? (
                <ProjectForm
                  project={project}
                  onSave={(updated: any) => handleEditProject(project.id, updated)}
                  onCancel={() => setEditingProject(null)}
                />
              ) : (
                <div className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex gap-4">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <FolderGit2 size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{project.name}</h3>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <p className="text-[14px] font-medium text-gray-700 mt-0.5">{project.role}</p>
                        {project.technologies && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <Code size={13} className="text-gray-400" />
                            <span className="text-[12px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                              {project.technologies}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingProject(project.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <div className="mt-3 text-[13px] text-gray-600 leading-relaxed max-w-3xl">
                      {project.description}
                    </div>
                  )}

                  {project.outcome && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-100">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Outcome & Impact</h4>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{project.outcome}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Summary */}
      {projects.length > 0 && (
        <div className="mt-8 p-5 rounded-xl bg-blue-50/30 border border-blue-100/50 flex flex-col md:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-blue-100">
            <Award size={18} />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-gray-900 text-sm font-bold tracking-tight">Project Portfolio</h4>
            <p className="text-gray-500 text-[12px]">
              Profile updated with <span className="text-primary font-semibold">{projects.length} self-project{projects.length !== 1 ? 's' : ''}</span>. Your proactive building experience is visible to recommendation systems.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
