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
