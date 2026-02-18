import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";

export default function ChatLayout() {
  const { themeColors } = useTheme();

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
