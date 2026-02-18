import { Stack } from "expo-router";
import { MaterialTopTabs } from "@/components/MaterialTopTabs";
import { ChatProvider } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { themeColors } = useTheme();

  return (
    <ChatProvider>
      <Stack.Screen options={{ headerTitle: "Chats" }} />

      <MaterialTopTabs
        screenOptions={{
          tabBarStyle: { backgroundColor: themeColors.bgPrimary },
          tabBarLabelStyle: {
            color: themeColors.textPrimary,
            fontWeight: "bold",
          },
          tabBarIndicatorStyle: {
            backgroundColor: themeColors.tabIconInactive,
          },
        }}
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
