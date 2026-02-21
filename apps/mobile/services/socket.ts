import { io, Socket } from "socket.io-client";

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
    });
    socket.connect();
  }

  return socket;
}
