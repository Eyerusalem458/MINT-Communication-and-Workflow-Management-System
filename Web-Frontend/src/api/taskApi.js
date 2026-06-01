import API from "./axios";



export const getTasks = (params) => API.get("/tasks", { params });

export const getTaskById = (id) => API.get(`/tasks/${id}`);

export const getTaskStats = () => API.get("/tasks/stats");

export const createTask = (data) => API.post("/tasks", data);

export const updateTask = (id, formData) =>
  API.put(`/tasks/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateTaskStatus = (id, status, comment = "") =>{
  const fd = new FormData();
  fd.append("status", status);
  if (comment) fd.append("comment", comment);
  return API.put(`/tasks/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteTask = (id) => API.delete(`/tasks/${id}`);

