import { Stack } from "expo-router";
import { MaterialTopTabs } from "@/components/MaterialTopTabs";
import { ChatProvider } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <ChatProvider>
      <Stack.Screen options={{ headerTitle: "Chats" }} />

      <MaterialTopTabs
        screenOptions={{ tabBarStyle: { backgroundColor: themeColors.bgPrimary }, tabBarLabelStyle: {color: themeColors.textPrimary, fontWeight: "bold"} }}
      >
        <MaterialTopTabs.Screen
          name="you-liked"
          options={{ title: "You liked" }}
        />
        <MaterialTopTabs.Screen
          name="they-liked"
          options={{ title: "They liked" }}
        />
        <MaterialTopTabs.Screen
          name="both-liked"
          options={{ title: "Both liked" }}
        />
      </MaterialTopTabs>
    </ChatProvider>
  );
}
