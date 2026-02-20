import { createContext, useContext, ReactNode, useState, useEffect, useRef } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Conversation } from "@/types/Conversation";
import { getSocket } from "@/services/socket";

interface ConversationsContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

const getTime = (date?: string | Date) => {
  if (!date) return 0;
  return new Date(date).getTime();
};

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useFetch<Conversation[]>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const refetchRef = useRef(refetch);
  useEffect(() => { refetchRef.current = refetch; });

  useEffect(() => {
    if (data) {
      setConversations((prev) => {
        const localMap = new Map(prev.map((c) => [c.other_user_id, c]));

        const merged = data.map((serverConv) => {
          const localConv = localMap.get(serverConv.other_user_id);

          if (
            localConv &&
            getTime(localConv.last_message_sent_at) > getTime(serverConv.last_message_sent_at)
          ) {
            return localConv;
          }
          return serverConv;
        });

        return merged.sort((a, b) => 
          getTime(b.last_message_sent_at) - getTime(a.last_message_sent_at)
        );
      });
    }
  }, [data]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (msg: any) => {
      setConversations((prev) => {
        const isExisting = prev.some(
          (c) => c.other_user_id === msg.sender_id || c.other_user_id === msg.receiver_id
        );

        if (!isExisting) {
          refetchRef.current();
          return prev;
        }

        return prev
          .map((c) =>
            c.other_user_id === msg.sender_id || c.other_user_id === msg.receiver_id
              ? {
                  ...c,
                  last_message: msg.message_content,
                  last_message_type: msg.message_type,
                  last_message_sent_at: msg.sent_at,
                  last_message_sender_id: msg.sender_id,
                }
              : c
          )
          .sort((a, b) => getTime(b.last_message_sent_at) - getTime(a.last_message_sent_at));
      });
    };

    const handleDeleteMessage = () => {
      refetchRef.current();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("delete_message", handleDeleteMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("delete_message", handleDeleteMessage);
    };
  }, []);

  return (
    <ConversationsContext.Provider value={{ conversations, setConversations, loading, refetch }}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (!context) throw new Error("useConversations must be used within ConversationsContext");
  return context;
}
