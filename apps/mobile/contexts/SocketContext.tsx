import { createContext, useContext } from "react";
import { getSocket } from "@/services/socket";
import type { Socket } from "socket.io-client";

const SocketContext = createContext<Socket>(getSocket());
export const useSocket = () => useContext(SocketContext);
export const SocketProvider = ({ children }: { children: React.ReactNode }) => (
  <SocketContext.Provider value={getSocket()}>{children}</SocketContext.Provider>
);

