import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/projects",
});

// Token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getProjects = () => API.get("/");

export const getProjectById = (id) => API.get(`/${id}`);

export const createProject = (data) => API.post("/", data);

export const updateProject = (id, data) => API.put(`/${id}`, data);

export const deleteProject = (id) => API.delete(`/${id}`);