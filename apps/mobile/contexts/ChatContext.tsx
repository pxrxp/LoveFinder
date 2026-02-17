import { createContext, useContext, ReactNode } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Conversation } from "@/types/Conversation";

interface ChatContextType {
  conversations: Conversation[] | undefined;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useFetch<Conversation[]>("chat");

  return (
    <ChatContext.Provider value={{ conversations: data ?? [], loading, refetch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
