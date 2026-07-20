import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

const getAdminToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("adminToken") || localStorage.getItem("authToken");
    }
    return null;
};

export const getMobileBanner = async () => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/api/settings/mobile-banner`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch mobile banner:", error);
        throw error;
    }
};

export const updateMobileBanner = async (bannerUrl: string) => {
    try {
        const token = getAdminToken();
        const response = await axios.post(`${API_BASE_URL}/api/settings/mobile-banner`, { bannerUrl }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
};

export const uploadMobileBanner = async (file: File) => {
    try {
        const token = getAdminToken();
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(`${API_BASE_URL}/api/settings/upload-banner`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading banner:", error);
        throw error;
    }
};
