import { colors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";

export default function ChatLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

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
