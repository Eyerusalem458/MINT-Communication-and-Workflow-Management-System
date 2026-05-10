import API from "./axios";




export const getNotifications = (params) => API.get("/notifications", { params });

export const getUnseenCount = () => API.get("/notifications/unseen-count");

export const markAllAsRead = () => API.patch("/notifications/read-all");

export const markAsRead = (id) => API.patch(`/notifications/${id}/read`);
