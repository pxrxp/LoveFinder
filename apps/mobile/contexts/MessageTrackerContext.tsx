import { createContext, useContext, useState, ReactNode } from "react";

interface MessageTrackerContextValue {
  unreadCounts: Record<string, number>;
  activeChatUserId: string | null;
  setActiveChatUserId: (id: string | null) => void;
  markAsRead: (userId: string) => void;
  incrementUnread: (userId: string) => void;
  resetAll: () => void;
}

const MessageTrackerContext = createContext<
  MessageTrackerContextValue | undefined
>(undefined);

export function MessageTrackerProvider({ children }: { children: ReactNode }) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  const markAsRead = (userId: string) =>
    setUnreadCounts((prev) => ({ ...prev, [userId]: 0 }));
  const incrementUnread = (userId: string) =>
    setUnreadCounts((prev) => ({ ...prev, [userId]: (prev[userId] || 0) + 1 }));
  const resetAll = () => setUnreadCounts({});

  return (
    <MessageTrackerContext.Provider
      value={{
        unreadCounts,
        activeChatUserId,
        setActiveChatUserId,
        markAsRead,
        incrementUnread,
        resetAll,
      }}
    >
      {children}
    </MessageTrackerContext.Provider>
  );
}

export function useMessageTracker() {
  const ctx = useContext(MessageTrackerContext);
  if (!ctx)
    throw new Error(
      "useMessageTracker must be used inside MessageTrackerProvider",
    );
  return ctx;
}
