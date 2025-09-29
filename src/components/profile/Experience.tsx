import React, { useState, useEffect } from 'react';
import { getExperiences, addExperience, updateExperience, deleteExperience } from '@/services/profileService';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch experiences when component mounts
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const experiencesData = await getExperiences();
        setExperiences(experiencesData || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExperiences();
  }, []);

  const handleAddExperience = async (experienceData) => {
    setIsLoading(true);
    try {
      const response = await addExperience(experienceData);
      
      if (response.success && response.experience) {
        setExperiences(prev => [response.experience, ...prev]);
        setIsAddingExperience(false);
      }
    } catch (error) {
      console.error('Error adding experience:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExperience = async (experienceId, updatedExperience) => {
    setIsLoading(true);
    try {
      const response = await updateExperience(experienceId, updatedExperience);
      
      if (response.success && response.experience) {
        setExperiences(prev => prev.map(exp => 
          exp.id === experienceId ? response.experience : exp
        ));
        setEditingExperience(null);
      }
    } catch (error) {
      console.error('Error updating experience:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    
    setIsLoading(true);
    try {
      const response = await deleteExperience(experienceId);
      
      if (response.success) {
        setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''}`;
    }
  };

  const ExperienceForm = ({ experience, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      companyName: experience?.companyName || '',
      role: experience?.role || '',
      startDate: experience?.startDate || '',
      endDate: experience?.endDate || '',
      description: experience?.description || '',
      achievements: experience?.achievements || '',
      isCurrentJob: !experience?.endDate
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.companyName.trim() && formData.role.trim() && formData.startDate) {
        const dataToSave = {
          ...formData,
          endDate: formData.isCurrentJob ? null : formData.endDate
        };
        delete dataToSave.isCurrentJob;
        onSave(dataToSave);
      }
    };

    return (
      <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 bg-gray-800 border-gray-600`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-600 bg-gray-700 text-white placeholder-gray-400`}
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                Job Title *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-600 bg-gray-700 text-white placeholder-gray-400`}
                placeholder="Enter job title"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-600 bg-gray-700 text-white`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-200 mb-2`}>
                End Date
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={formData.isCurrentJob}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-600 bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-500`}
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isCurrentJob}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isCurrentJob: e.target.checked,
                      endDate: e.target.checked ? '' : prev.endDate
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`ml-2 text-sm text-gray-300`}>I currently work here</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-200 mb-2`}>
              Job Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none border-gray-600 bg-gray-700 text-white placeholder-gray-400`}
              placeholder="Describe your role and responsibilities..."
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-200 mb-2`}>
              Key Achievements
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none border-gray-600 bg-gray-700 text-white placeholder-gray-400`}
              placeholder="List your key achievements and accomplishments..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.companyName.trim() || !formData.role.trim() || !formData.startDate}
              className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : (experience ? 'Update Experience' : 'Add Experience')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold text-white mb-2`}>
            Work Experience
          </h2>
          <p className={`text-sm sm:text-base text-gray-300`}>
            Showcase your professional journey and achievements
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddingExperience(true)}
            disabled={isAddingExperience}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="mr-2 text-white">➕</span>
            Add Experience
          </button>
        </div>
      </div>

      {/* Add Experience Form */}
      {isAddingExperience && (
        <div className="mb-6">
          <ExperienceForm
            onSave={handleAddExperience}
            onCancel={() => setIsAddingExperience(false)}
          />
        </div>
      )}

      {/* Experience List */}
      <div className="space-y-6">
        {experiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400">💼</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work experience added yet</h3>
            <p className="text-gray-500 mb-4">Start building your professional profile by adding your work experience</p>
            <button
              onClick={() => setIsAddingExperience(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">➕</span>
              Add Your First Experience
            </button>
          </div>
        ) : (
          experiences.map((experience, index) => (
            <div key={experience.id}>
              {editingExperience === experience.id ? (
                <ExperienceForm
                  experience={experience}
                  onSave={(updatedExperience) => handleEditExperience(experience.id, updatedExperience)}
                  onCancel={() => setEditingExperience(null)}
                />
              ) : (
                <div className="group bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 hover:border-gray-600 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{experience.role}</h3>
                        {!experience.endDate && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-blue-600 font-medium mb-1 text-white">{experience.companyName}</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(experience.startDate)} - {formatDate(experience.endDate)} • {calculateDuration(experience.startDate, experience.endDate)}
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-3 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingExperience(experience.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit experience"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete experience"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {experience.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-2">Description</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{experience.description}</p>
                    </div>
                  )}
                  
                  {experience.achievements && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Key Achievements</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{experience.achievements}</p>
                    </div>
                  )}
                  
                  {index < experiences.length - 1 && (
                    <div className="absolute left-8 mt-6 w-px h-6 bg-gray-600"></div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Experience Summary */}
      {experiences.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-purple-600 text-lg">📈</span>
            <h4 className="font-semibold text-purple-900">Career Summary</h4>
          </div>
          <p className="text-purple-800 text-sm">
            You have <strong>{experiences.length}</strong> work experience{experiences.length !== 1 ? 's' : ''} in your profile.
            {experiences.some(exp => !exp.endDate) && ' Currently employed at one position.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Experience;