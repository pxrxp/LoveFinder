import { io, Socket } from "socket.io-client";

const BACKEND_BASE_URL = "http://192.168.1.70:3000";
// const BACKEND_BASE_URL = 'http://172.25.140.84:3000/api/v1/'

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
