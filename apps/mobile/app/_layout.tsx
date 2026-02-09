import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  const onboarded = false;
  const authenticated = true;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!authenticated}>
        <Stack.Screen name="(auth)" />
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

