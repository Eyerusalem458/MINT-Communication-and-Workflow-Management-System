import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/tasks",
});

// Token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getTasks = () => API.get("/");

export const getTaskById = (id) => API.get(`/${id}`);

export const createTask = (data) => API.post("/", data);

export const updateTask = (id, data) => API.put(`/${id}`, data);

export const deleteTask = (id) => API.delete(`/${id}`);

export const assignTask = (id, assigneeId) => API.put(`/${id}/assign`, { assigneeId });