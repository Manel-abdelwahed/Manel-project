import axios from "axios"
import { API_CONFIG } from "../config/api.config"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
}

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),
  getCommercials: () => api.get("/users/commercials"),
  create: (userData) => api.post("/users", userData),
  update: (userId, userData) => api.put(`/users/${userId}`, userData),
  updateProfile: (userData) => api.put("/users/profile/me", userData),
  delete: (userId) => api.delete(`/users/${userId}`),
}

// Campaigns API
export const campaignsAPI = {
  getAll: () => api.get("/campaigns"),
  getById: (campaignId) => api.get(`/campaigns/${campaignId}`),
  create: (campaignData) => api.post("/campaigns", campaignData),
  update: (campaignId, campaignData) => api.put(`/campaigns/${campaignId}`, campaignData),
  delete: (campaignId) => api.delete(`/campaigns/${campaignId}`),
}

// Clients API
export const clientsAPI = {
  getAll: () => api.get("/clients"),
  getById: (clientId) => api.get(`/clients/${clientId}`),
  create: (clientData) => api.post("/clients", clientData),
  update: (clientId, clientData) => api.put(`/clients/${clientId}`, clientData),
  delete: (clientId) => api.delete(`/clients/${clientId}`),
}

export const leadsAPI = {
  getAll: () => api.get("/leads"),
  getById: (leadId) => api.get(`/leads/${leadId}`),
  create: (leadData) => api.post("/leads", leadData),
  update: (leadId, leadData) => api.put(`/leads/${leadId}`, leadData),
  delete: (leadId) => api.delete(`/leads/${leadId}`),
  updateStatus: (leadId, status) => api.patch(`/leads/${leadId}/status`, { status }),
  addInteraction: (leadId, interaction) => api.post(`/leads/${leadId}/interaction`, interaction),
  getByStatus: (status) => api.get("/leads/status", { params: { status } }),
}

// Analytics API
export const analyticsAPI = {
  add: (analyticsData) => api.post("/analytics/add", analyticsData),
  getByCampaign: (campaignId) => api.get(`/analytics/${campaignId}`),
  syncFacebook: (campaignId, accessToken, adAccountId) =>
    api.get(`/analytics/sync/facebook/${campaignId}/${accessToken}/${adAccountId}`),
  syncGoogle: (campaignId) => api.get(`/analytics/sync/google/${campaignId}`),
  getDashboardStats: () => api.get("/analytics/dashboard"),
}

export const tasksAPI = {
  getAll: () => api.get("/tasks"),
  getById: (taskId) => api.get(`/tasks/${taskId}`),
  create: (taskData) => api.post("/tasks", taskData),
  update: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
}

export default api
