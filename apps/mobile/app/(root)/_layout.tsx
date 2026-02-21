import { Stack } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColorScheme } from "nativewind";
import LoadingScreen from "@/components/LoadingScreen";

export default function AppLayout() {
  const { user, loading } = useContext(AuthContext)!;

  const { theme } = useTheme();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  if (loading) return <LoadingScreen />;

  const authenticated = !!user;
  const onboarded = user?.is_onboarded ?? false;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!authenticated}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>

      <Stack.Protected guard={authenticated}>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  );
}
