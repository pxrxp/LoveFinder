import { io, Socket } from "socket.io-client";

const BACKEND_BASE_URL = 'http://192.168.1.70:3000'
// const BACKEND_BASE_URL = 'http://172.25.140.84:3000/api/v1/'

export let socket: Socket;

export function initSocket() {
  socket = io(BACKEND_BASE_URL, {
    transports: ["websocket"],
    autoConnect: false,
    withCredentials: true,
  });

  return socket;
}

