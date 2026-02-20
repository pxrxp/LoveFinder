import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { useFetch } from "@/hooks/useFetch";
import { Conversation } from "@/types/Conversation";
import { getSocket } from "@/services/socket";
import { apiFetch } from "@/services/api";

interface ConversationsContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  loading: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadingMore: boolean;
}

const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);

const getTime = (date?: string | Date) => {
  if (!date) return 0;
  return new Date(date).getTime();
};

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useFetch<Conversation[]>(
    "chat?limit=20&offset=0",
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  });

  useEffect(() => {
    if (data) {
      setConversations((prev) => {
        const localMap = new Map(prev.map((c) => [c.other_user_id, c]));

        const merged = data.map((serverConv) => {
          const localConv = localMap.get(serverConv.other_user_id);

          if (
            localConv &&
            getTime(localConv.last_message_sent_at) >
              getTime(serverConv.last_message_sent_at)
          ) {
            return localConv;
          }
          return serverConv;
        });

        return merged.sort(
          (a, b) =>
            getTime(b.last_message_sent_at) - getTime(a.last_message_sent_at),
        );
      });
    }
  }, [data]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (msg: any) => {
      setConversations((prev) => {
        const isExisting = prev.some(
          (c) =>
            c.other_user_id === msg.sender_id ||
            c.other_user_id === msg.receiver_id,
        );

        if (!isExisting) {
          refetchRef.current();
          return prev;
        }

        return prev
          .map((c) =>
            c.other_user_id === msg.sender_id ||
            c.other_user_id === msg.receiver_id
              ? {
                  ...c,
                  last_message: msg.message_content,
                  last_message_type: msg.message_type,
                  last_message_sent_at: msg.sent_at,
                  last_message_sender_id: msg.sender_id,
                }
              : c,
          )
          .sort(
            (a, b) =>
              getTime(b.last_message_sent_at) - getTime(a.last_message_sent_at),
          );
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

  const loadMore = async () => {
    if (loadingMore || !hasMore || conversations.length === 0) return;

    setLoadingMore(true);
    const offset = conversations.length;

    try {
      const res = await apiFetch(`chat?limit=20&offset=${offset}`);
      const newData: Conversation[] = await res.json();

      if (newData.length < 20) setHasMore(false);

      if (newData.length > 0) {
        setConversations((prev) => {
          const combined = [...prev, ...newData];
          const unique = Array.from(
            new Map(
              combined.map((item) => [item.other_user_id, item]),
            ).values(),
          );
          return unique;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        setConversations,
        loading,
        refetch,
        loadMore,
        loadingMore,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (!context)
    throw new Error(
      "useConversations must be used within ConversationsContext",
    );
  return context;
}
