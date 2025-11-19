import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ensure your key is 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data) => {
    return await api.post("/auth/register", data);
  },
  login: async (data) => {
    return await api.post("/auth/login", data);
  },
  getCurrentUser: () => api.get("/auth/me"),
};

// Missing Persons API
export const missingPersonsAPI = {
  getAll: (params) => api.get("/missing-persons", { params }),
  getById: (id) => api.get(`/missing-persons/${id}`),

  // FIX: Added 'return' keyword
  create: (formData) => {
    console.log(formData);
    return api.post("/missing-persons", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Necessary for FormData upload
      },
    });
  },

  update: (id, data) => api.put(`/missing-persons/${id}`, data),
  delete: (id) => api.delete(`/missing-persons/${id}`),
};

export default api;
