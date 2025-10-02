import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://code-quest-backend-3y3q.onrender.com";

let socket = null;

export function connectSocket(userId) {
  if (!socket) {
    socket = io(SOCKET_URL, { withCredentials: true });
    if (userId) {
      socket.emit("join", userId);
    }
  }
  return socket;
}

export function getSocket() {
  return socket;
}
