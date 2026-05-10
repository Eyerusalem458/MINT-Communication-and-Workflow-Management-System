import API from "./axios";

export const loginUser = (data) => API.post("/auth/login", data);

export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const getMe = () => API.get("/auth/me");
