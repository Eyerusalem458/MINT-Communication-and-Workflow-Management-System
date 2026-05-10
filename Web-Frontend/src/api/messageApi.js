import API from "./axios";



export const getChatUsers = () => API.get("/messages/users");

export const getConversations = () => API.get("/messages/conversations");

export const getOrCreateDirectConversation = (userId) =>
  API.post("/messages/conversations/direct", { userId });

export const createGroupConversation = (name, participants) =>
  API.post("/messages/conversations/group", { name, participants });

export const getMessages = (conversationId) => API.get(`/messages/${conversationId}`);

export const sendMessage = (conversationId, formData) =>
  API.post(`/messages/${conversationId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteMessage = (messageId) =>
  API.delete(`/messages/message/${messageId}`);
