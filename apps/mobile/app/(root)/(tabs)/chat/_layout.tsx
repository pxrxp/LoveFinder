import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useUnreadCount } from "@/contexts/ConversationsContext";

export default function ChatLayout() {
  const { themeColors } = useTheme();
  const { clearUnread } = useUnreadCount();

  useFocusEffect(
    useCallback(() => {
      clearUnread();
    }, [clearUnread]),
  );

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: themeColors.bgPrimary,
        },
        headerTintColor: themeColors.textPrimary,
      }}
    />
  );
}
