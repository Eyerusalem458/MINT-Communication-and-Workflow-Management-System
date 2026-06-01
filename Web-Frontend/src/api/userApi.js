import API from "./axios";



export const getAllUsers = (params) => API.get("/users", { params });

export const getStaff = (params) => API.get("/users/staff", { params });

export const getUserById = (id) => API.get(`/users/${id}`);

export const createUser = (data) => API.post("/users", data);

export const updateUser = (id, data) => API.put(`/users/${id}`, data);

export const toggleUserStatus = (id) => API.patch(`/users/${id}/toggle-status`);

export const getUserStats = () => API.get("/users/stats");

export const updateMyProfile = (formData) =>
  API.put("/users/profile/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const changeMyPassword = (data) => API.put("/users/password/me", data);
