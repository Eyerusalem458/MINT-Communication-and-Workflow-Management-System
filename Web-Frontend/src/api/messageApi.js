import API from "./axios";



export const getChatUsers = () => API.get("/messages/users");

export const getConversations = () => API.get("/messages/conversations");

export const getOrCreateDirectConversation = (userId) =>
  API.post("/messages/conversations/direct", { userId });

export const createGroupConversation = (name, participants) =>
  API.post("/messages/conversations/group", { name, participants });

 
// update group name and/or add members
export const updateGroupConversation = (conversationId, data) =>
  API.patch(`/messages/conversations/${conversationId}`, data);

export const getMessages = (conversationId) => API.get(`/messages/${conversationId}`);

// fetch shared files/media/audio for a conversation
export const getSharedMedia = (conversationId) =>
  API.get(`/messages/${conversationId}/shared-media`);

export const sendMessage = (conversationId, formData) =>
  API.post(`/messages/${conversationId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteMessage = (messageId) =>
  API.delete(`/messages/message/${messageId}`);
