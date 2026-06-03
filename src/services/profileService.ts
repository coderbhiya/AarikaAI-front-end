import axiosInstance from "@/lib/axios";

export const getProfile = async () => {
  try {
    const response = await axiosInstance.get(`/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put(`/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const autoFillProfileFromResume = async (filePath: string, originalName: string) => {
  try {
    const response = await axiosInstance.post(`/profile/auto-fill-from-resume`, {
      filePath,
      originalName
    });
    return response.data;
  } catch (error) {
    console.error("Error auto-filling profile from resume:", error);
    throw error;
  }
};

// Skills API
export const getSkills = async () => {
  try {
    const response = await axiosInstance.get(`/profile/skills`);
    return response.data.skills;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};

export const addSkill = async (skillData) => {
  try {
    const response = await axiosInstance.post(`/profile/skills`, skillData);
    return response.data;
  } catch (error) {
    console.error("Error adding skill:", error);
    throw error;
  }
};

export const updateSkill = async (id, skillData) => {
  try {
    const response = await axiosInstance.put(`/profile/skills/${id}`, skillData);
    return response.data;
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
};

export const deleteSkill = async (id) => {
  try {
    const response = await axiosInstance.delete(`/profile/skills/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
};

// Experience API
export const getExperiences = async () => {
  try {
    const response = await axiosInstance.get(`/profile/experiences`);
    return response.data.experiences;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    throw error;
  }
};

export const addExperience = async (experienceData) => {
  try {
    const response = await axiosInstance.post(`/profile/experiences`, experienceData);
    return response.data;
  } catch (error) {
    console.error("Error adding experience:", error);
    throw error;
  }
};

export const updateExperience = async (id, experienceData) => {
  try {
    const response = await axiosInstance.put(`/profile/experiences/${id}`, experienceData);
    return response.data;
  } catch (error) {
    console.error("Error updating experience:", error);
    throw error;
  }
};

export const deleteExperience = async (id) => {
  try {
    const response = await axiosInstance.delete(`/profile/experiences/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting experience:", error);
    throw error;
  }
};

// Projects API
export const getProjects = async () => {
  try {
    const response = await axiosInstance.get(`/profile/projects`);
    return response.data.projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const addProject = async (projectData) => {
  try {
    const response = await axiosInstance.post(`/profile/projects`, projectData);
    return response.data;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await axiosInstance.put(`/profile/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await axiosInstance.delete(`/profile/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const approveResumeChanges = async (approvedData: { approvedFields: any; conflictResolution?: any }) => {
  try {
    const response = await axiosInstance.post(`/profile/approve-resume-changes`, approvedData);
    return response.data;
  } catch (error) {
    console.error("Error approving resume changes:", error);
    throw error;
  }
};

export const clearPendingResume = async () => {
  try {
    const response = await axiosInstance.post(`/profile/clear-pending-resume`);
    return response.data;
  } catch (error) {
    console.error("Error clearing pending resume:", error);
    throw error;
  }
};

// Education API
export const getEducations = async () => {
  try {
    const response = await axiosInstance.get(`/profile/educations`);
    return response.data.educations;
  } catch (error) {
    console.error("Error fetching educations:", error);
    throw error;
  }
};

export const addEducation = async (educationData) => {
  try {
    const response = await axiosInstance.post(`/profile/educations`, educationData);
    return response.data;
  } catch (error) {
    console.error("Error adding education:", error);
    throw error;
  }
};

export const updateEducation = async (id, educationData) => {
  try {
    const response = await axiosInstance.put(`/profile/educations/${id}`, educationData);
    return response.data;
  } catch (error) {
    console.error("Error updating education:", error);
    throw error;
  }
};

export const deleteEducation = async (id) => {
  try {
    const response = await axiosInstance.delete(`/profile/educations/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting education:", error);
    throw error;
  }
};
