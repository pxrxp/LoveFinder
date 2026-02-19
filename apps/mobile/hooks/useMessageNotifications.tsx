import { useEffect, useRef, useContext } from "react";
import { useMessageTracker } from "@/contexts/MessageTrackerContext";
import { AuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext"; // Added
import { Message } from "@/types/chat";
import { showMessage } from "react-native-flash-message";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";
import { getSocket } from "@/services/socket";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export function useMessageNotifications() {
  const socket = getSocket();
  const { user } = useContext(AuthContext)!;
  const { settings } = useSettings();
  const { activeChatUserId, incrementUnread } = useMessageTracker();
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const activeIdRef = useRef(activeChatUserId);

  useEffect(() => {
    activeIdRef.current = activeChatUserId;
  }, [activeChatUserId]);

  useEffect(() => {
    const handler = (msg: Message) => {
      const senderId = String(msg.sender_id);
      const myId = String(user?.user_id);
      const currentChatId = activeIdRef.current
        ? String(activeIdRef.current)
        : null;

      if (senderId === myId) return;

      if (senderId !== currentChatId) {
        incrementUnread(msg.sender_id);

        if (settings.getNotifications) {
          showMessage({
            message: `${msg.sender_name}`,
            description:
              msg.message_type === "text"
                ? msg.message_content
                : "Sent an attachment",
            type: "info",
            icon: () => (
              <Ionicons
                name="notifications"
                size={24}
                color={themeColors.textPrimary}
                style={{ paddingRight: 15 }}
              />
            ),
            floating: true,
            duration: 4000,
            style: {
              backgroundColor: themeColors.bgPrimary,
              borderLeftWidth: 4,
              borderLeftColor: colors.light.accent,
              marginTop: 35,
            },
            color: themeColors.textPrimary,
            onPress: () => {
              router.push(`/(root)/(tabs)/chat/${msg.sender_id}`);
            },
          });
        }
      }
    };

    socket.on("new_message", handler);
    return () => {
      socket.off("new_message", handler);
    };
  }, [socket, user?.user_id, themeColors, settings.getNotifications]);
}
