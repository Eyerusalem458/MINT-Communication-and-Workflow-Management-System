import API from "./axios";


export const getProjects = (params) => API.get("/projects", { params });
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const getProjectStats = () => API.get("/projects/stats");

export const createProject = (formData) =>
  API.post("/projects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProject = (id, formData) =>
  API.put(`/projects/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const cancelProject = (id) => API.patch(`/projects/${id}/cancel`);

export const approveProject = (id) => API.patch(`/projects/${id}/approve`);

export const rejectProject = (id, comment) =>
  API.patch(`/projects/${id}/reject`, { comment });
