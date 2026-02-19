import { useEffect } from "react";
import { getSocket } from "@/services/socket";
import { Message } from "@/types/chat";

export function useChatSocket({
  otherUserId,
  onMessage,
  onDelete,
  onError,
  sendReceipts,
}: {
  otherUserId: string;
  onMessage: (msg: Message) => void;
  onDelete: (messageId: string) => void;
  onError: (msg: string) => void;
  sendReceipts: boolean;
}) {
  const socket = getSocket();

  useEffect(() => {
    socket.emit("join_room", {
      other_user_id: otherUserId,
    });

    if (sendReceipts) {
      socket.emit("mark_as_read", {
        other_user_id: otherUserId,
      });
    }

    const handleNewMessage = (msg: Message) =>
      onMessage(msg);

    const handleDelete = ({ message_id }: any) =>
      onDelete(message_id);

    const handleError = ({ action, error }: any) =>
      onError(`${action}\n${error}`);

    socket.on("new_message", handleNewMessage);
    socket.on("delete_message", handleDelete);
    socket.on("ws_error", handleError);

    return () => {
      socket.emit("leave_room", {
        other_user_id: otherUserId,
      });

      socket.off("new_message", handleNewMessage);
      socket.off("delete_message", handleDelete);
      socket.off("ws_error", handleError);
    };
  }, [otherUserId]);

  return socket;
}
