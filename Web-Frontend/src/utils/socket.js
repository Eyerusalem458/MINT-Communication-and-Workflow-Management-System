import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket"],
});

export const connectSocket = (userId) => {
  if (!socket.connected) socket.connect();
  socket.emit("join_user", userId);
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
