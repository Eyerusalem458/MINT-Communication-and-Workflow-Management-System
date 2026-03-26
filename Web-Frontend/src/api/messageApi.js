import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/messages",
});

// Token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getMessages = (conversationId) => API.get(`/${conversationId}`);

export const sendMessage = (data) => API.post("/", data);

export const deleteMessage = (id) => API.delete(`/${id}`);