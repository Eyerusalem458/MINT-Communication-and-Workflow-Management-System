import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// Token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const loginUser = (data) => API.post("/login", data);

export const registerUser = (data) => API.post("/register", data);

export const forgotPassword = (email) =>
  API.post("/forgot-password", { email });

export const resetPassword = (data) => API.post("/reset-password", data);
