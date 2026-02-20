import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
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
  hasMore: boolean;
}

const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);

const getTime = (date?: string | Date) => {
  if (!date) return 0;
  return new Date(date).getTime();
};

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalOffset, setTotalOffset] = useState(0);

  const { data, loading, refetch } = useFetch<Conversation[]>(
    "chat?limit=20&offset=0",
  );

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  });

  useEffect(() => {
    if (data) {
      setConversations(data);
      setTotalOffset(data.length);
      setHasMore(data.length >= 20);
    }
  }, [data]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const res = await apiFetch(`chat?limit=20&offset=${totalOffset}`);
      const newData: Conversation[] = await res.json();

      if (newData.length < 20) setHasMore(false);

      if (newData.length > 0) {
        setTotalOffset((prev) => prev + newData.length);
        setConversations((prev) => {
          const combined = [...prev, ...newData];
          const unique = Array.from(
            new Map(
              combined.map((item) => [item.other_user_id, item]),
            ).values(),
          );
          return unique.sort(
            (a, b) =>
              getTime(b.last_message_sent_at) - getTime(a.last_message_sent_at),
          );
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, totalOffset]);

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

    const handleDeleteMessage = () => refetchRef.current();

    socket.on("new_message", handleNewMessage);
    socket.on("delete_message", handleDeleteMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("delete_message", handleDeleteMessage);
    };
  }, []);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        setConversations,
        loading,
        refetch,
        loadMore,
        loadingMore,
        hasMore,
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
