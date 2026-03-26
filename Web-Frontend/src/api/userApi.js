import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/users",
});

// Token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getUserProfile = () => API.get("/profile");

export const updateUserProfile = (data) => API.put("/profile", data);

export const getUsers = () => API.get("/");

export const getUserById = (id) => API.get(`/${id}`);