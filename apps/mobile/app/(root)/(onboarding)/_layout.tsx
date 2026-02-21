import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  const { themeColors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: themeColors.bgPrimary },
        headerTitle: "",
        headerTintColor: themeColors.accent,
        animation: "slide_from_right",
        presentation: "transparentModal",
      }}
    />
  );
}
