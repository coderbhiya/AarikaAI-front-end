import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Dedicated axios instance for Admin requests
const adminAxios = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach the admin token
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle admin-specific errors (e.g., unauthorized)
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export const adminLogin = async (email: string, password: string) => {
  const response = await adminAxios.post("/login", { email, password });
  if (response.data.success && response.data.token) {
    localStorage.setItem("adminToken", response.data.token);
    localStorage.setItem("adminUser", JSON.stringify(response.data.admin));
  }
  return response.data;
};

export const adminRegister = async (data: any) => {
  const response = await adminAxios.post("/register", data);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await adminAxios.get("/dashboard/stats");
  return response.data.stats;
};

export const getUsers = async (page = 1, limit = 10, search = "", status = "") => {
  const response = await adminAxios.get("/users", {
    params: { page, limit, search, status },
  });
  return response.data;
};

export const getUserById = async (id: string | number) => {
  const response = await adminAxios.get(`/users/${id}`);
  return response.data.user;
};

export const updateUser = async (id: string | number, data: any) => {
  const response = await adminAxios.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string | number) => {
  const response = await adminAxios.delete(`/users/${id}`);
  return response.data;
};

export const getPrompts = async (search = "") => {
  const response = await adminAxios.get("/prompts", { params: { search } });
  return response.data.prompts;
};

export const createPrompt = async (data: any) => {
  const response = await adminAxios.post("/prompts", data);
  return response.data;
};

export const updatePrompt = async (id: string | number, data: any) => {
  const response = await adminAxios.put(`/prompts/${id}`, data);
  return response.data;
};

export const deletePrompt = async (id: string | number) => {
  const response = await adminAxios.delete(`/prompts/${id}`);
  return response.data;
};

export const activatePrompt = async (id: string | number) => {
  const response = await adminAxios.put(`/prompts/${id}/activate`);
  return response.data;
};

export const getJobs = async (page = 1, limit = 10, search = "", status = "") => {
  const response = await adminAxios.get("/jobs", {
    params: { page, limit, search, status },
  });
  return response.data;
};

export const updateJobStatus = async (id: string | number, status: string) => {
  const response = await adminAxios.put(`/jobs/${id}`, { status });
  return response.data;
};

export const deleteJob = async (id: string | number) => {
  const response = await adminAxios.delete(`/jobs/${id}`);
  return response.data;
};

export const getSystemSettings = async () => {
  const response = await adminAxios.get("/settings");
  return response.data.settings;
};

export const updateSystemSettings = async (settings: any) => {
  const response = await adminAxios.put("/settings", { settings });
  return response.data;
};
