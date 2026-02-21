/**
 * Live Conversations and Chat Synchronizer.
 * 
 * This is the most complex state in the app. It:
 * 1. Fetches: Loads "Matches", "You Liked", and "They Liked" lists.
 * 2. Sockets: Listens for 'new_message' or 'new_match' to update lists instantly 
 *    without the user needing to pull-to-refresh.
 * 3. Deduplication: Ensures users don't appear twice if they send multiple messages.
 */
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Conversation } from "@/types/Conversation";
import { getSocket } from "@/services/socket";
import { fetchConversations } from "@/services/chat";

export type SwipeCategory = "both" | "you" | "they";

interface CategoryState {
  data: Conversation[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  offset: number;
}

interface ConversationsContextValue {
  states: Record<SwipeCategory, CategoryState>;
  refetch: (category: SwipeCategory) => Promise<void>;
  loadMore: (category: SwipeCategory) => Promise<void>;
}

const ConversationsContext = createContext<
  ConversationsContextValue | undefined
>(undefined);

const getTime = (date?: string | Date) => {
  if (!date) return 0;
  return new Date(date).getTime();
};

const initialCategoryState: CategoryState = {
  data: [],
  loading: true,
  loadingMore: false,
  hasMore: true,
  offset: 0,
};

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<SwipeCategory, CategoryState>>({
    both: { ...initialCategoryState },
    you: { ...initialCategoryState },
    they: { ...initialCategoryState },
  });

  const statesRef = useRef(states);
  useEffect(() => {
    statesRef.current = states;
  }, [states]);

  const fetchCategory = useCallback(
    async (category: SwipeCategory, isLoadMore = false) => {
      const currentState = statesRef.current[category];
      if (isLoadMore && (!currentState.hasMore || currentState.loadingMore))
        return;

      const offset = isLoadMore ? currentState.offset : 0;

      setStates((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [isLoadMore ? "loadingMore" : "loading"]: true,
        },
      }));

      try {
        const res = await fetchConversations(category, offset);
        const newData: Conversation[] = await res.json();

        setStates((prev) => {
          const currentData = isLoadMore ? prev[category].data : [];
          const combined = [...currentData, ...newData];
          const unique = Array.from(
            new Map(
              combined.map((item) => [item.other_user_id, item]),
            ).values(),
          );
          const sorted = unique.sort(
            (a, b) =>
              getTime(b.last_message_sent_at) - getTime(a.last_message_sent_at),
          );

          return {
            ...prev,
            [category]: {
              data: sorted,
              loading: false,
              loadingMore: false,
              hasMore: newData.length >= 20,
              offset: offset + newData.length,
            },
          };
        });
      } catch (e) {
        setStates((prev) => ({
          ...prev,
          [category]: {
            ...prev[category],
            loading: false,
            loadingMore: false,
          },
        }));
      }
    },
    [],
  );

  const refetch = useCallback(
    async (category: SwipeCategory) => fetchCategory(category, false),
    [fetchCategory],
  );

  const loadMore = useCallback(
    async (category: SwipeCategory) => fetchCategory(category, true),
    [fetchCategory],
  );

  useEffect(() => {
    fetchCategory("both");
    fetchCategory("you");
    fetchCategory("they");
  }, [fetchCategory]);

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (msg: any) => {
      setStates((prev) => {
        const newStates = { ...prev };
        let updatedExisting = false;

        (["both", "you", "they"] as SwipeCategory[]).forEach((cat) => {
          const list = prev[cat].data;
          const index = list.findIndex(
            (c) =>
              c.other_user_id === msg.sender_id ||
              c.other_user_id === msg.receiver_id,
          );

          if (index !== -1) {
            updatedExisting = true;
            const updatedItem = {
              ...list[index],
              last_message: msg.message_content,
              last_message_type: msg.message_type,
              last_message_sent_at: msg.sent_at,
              last_message_sender_id: msg.sender_id,
            };

            const updatedList = [
              updatedItem,
              ...list.slice(0, index),
              ...list.slice(index + 1),
            ];

            newStates[cat] = { ...prev[cat], data: updatedList };
          }
        });

        if (!updatedExisting) {
          // If it's a new conversation, we need to refetch to get the full object
          refetchRef.current("both");
          refetchRef.current("they");
        }

        return newStates;
      });
    };

    const handleDeleteMessage = () => {
      refetchRef.current("both");
      refetchRef.current("you");
      refetchRef.current("they");
    };

    const handleNewMatch = () => {
      refetchRef.current("both");
      refetchRef.current("they");
      refetchRef.current("you");
    };

    const handleNewLike = () => {
      refetchRef.current("they");
    };

    socket.on("new_message", handleNewMessage);
    socket.on("delete_message", handleDeleteMessage);
    socket.on("new_match", handleNewMatch);
    socket.on("new_like", handleNewLike);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("delete_message", handleDeleteMessage);
      socket.off("new_match", handleNewMatch);
      socket.off("new_like", handleNewLike);
    };
  }, []);

  return (
    <ConversationsContext.Provider value={{ states, refetch, loadMore }}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations(category: SwipeCategory) {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error(
      "useConversations must be used within ConversationsContext",
    );
  }

  const state = context.states[category];

  return {
    conversations: state.data,
    loading: state.loading,
    loadingMore: state.loadingMore,
    hasMore: state.hasMore,
    refetch: () => context.refetch(category),
    loadMore: () => context.loadMore(category),
  };
}
