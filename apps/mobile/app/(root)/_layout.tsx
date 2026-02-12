import { Stack } from 'expo-router';
import {ActivityIndicator, Appearance, Text, View} from 'react-native';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from "nativewind";

export default function AppLayout() {
  const { user, loading } = useContext(AuthContext)!;

  const { theme } = useTheme();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  if (loading) return (
    <SafeAreaView className='flex-1 p-10'>
      <ActivityIndicator size={"large"}/>
    </SafeAreaView>
    );

  const authenticated = !!user;
  const onboarded = true;

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
