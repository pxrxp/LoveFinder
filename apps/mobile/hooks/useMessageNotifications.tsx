import { useEffect } from "react";
import { useMessageTracker } from "@/contexts/MessageTrackerContext";
import { Message } from "@/types/chat";
import { showMessage } from "react-native-flash-message";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";
import { getSocket } from "@/services/socket";

export function useMessageNotifications() {
  const socket = getSocket();
  const { activeChatUserId, incrementUnread } = useMessageTracker();
  const { theme } = useTheme();
  const themeColors = colors[theme];

  useEffect(() => {
    const handler = (msg: Message) => {
      if (msg.sender_id === activeChatUserId) return;

      incrementUnread(msg.sender_id);

      showMessage({
        message: `New message from ${msg.sender_name}`,
        description: msg.message_type === "text" ? msg.message_content : "Sent an attachment",
        type: "info",
        floating: true,
        duration: 4000,
        style: { backgroundColor: themeColors.bgPrimary },
        color: themeColors.textPrimary,
      });
    };

    socket.on("new_message", handler);
    return () => {
      socket.off("new_message", handler);
    };
  }, [socket, activeChatUserId, theme]);
}
