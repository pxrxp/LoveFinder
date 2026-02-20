import { useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import { getSocket } from "@/services/socket";
import { Message } from "@/types/chat";

export function useChatSocket({
  otherUserId,
  onMessage,
  onDelete,
  onError,
  sendReceipts,
}: {
  otherUserId: string | string[];
  onMessage: (msg: Message) => void;
  onDelete: (messageId: string) => void;
  onError: (msg: string) => void;
  sendReceipts: boolean;
}) {
  const socket = getSocket();
  const isFocused = useIsFocused();
  const stateRef = useRef({ onMessage, onDelete, onError, sendReceipts });

  stateRef.current = { onMessage, onDelete, onError, sendReceipts };

  const targetId = Array.isArray(otherUserId) ? otherUserId[0] : otherUserId;

  useEffect(() => {
    if (!targetId || !isFocused) return;

    socket.emit("join_room", { other_user_id: targetId });

    if (stateRef.current.sendReceipts) {
      socket.emit("mark_as_read", { other_user_id: targetId });
    }

    const handleNewMessage = (msg: Message) => stateRef.current.onMessage(msg);
    const handleDelete = (payload: any) => stateRef.current.onDelete(payload?.message_id);
    const handleError = (payload: any) => stateRef.current.onError(`${payload?.action}\n${payload?.error}`);

    socket.on("new_message", handleNewMessage);
    socket.on("delete_message", handleDelete);
    socket.on("ws_error", handleError);

    return () => {
      socket.emit("leave_room", { other_user_id: targetId });
      socket.off("new_message", handleNewMessage);
      socket.off("delete_message", handleDelete);
      socket.off("ws_error", handleError);
    };
  }, [targetId, isFocused]);

  return socket;
}
