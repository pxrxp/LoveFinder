import "@/global.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import * as SystemUI from "expo-system-ui";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import FlashMessage from "react-native-flash-message";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { MessageTrackerProvider } from "@/contexts/MessageTrackerContext";

function ThemedRoot({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const bgColor =
    theme === "light" ? colors.light.bgPrimary : colors.dark.bgPrimary;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(bgColor);
  }, [bgColor]);

  return (
    <GestureHandlerRootView>
      <StatusBar style={theme === "light" ? "dark" : "light"} />
      {children}
    </GestureHandlerRootView>
  );
}

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "OpenSans-Regular": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-Italic": require("../assets/fonts/OpenSans-Italic.ttf"),
    "OpenSans-SemiBold": require("../assets/fonts/OpenSans-SemiBold.ttf"),
    "OpenSans-SemiBoldItalic": require("../assets/fonts/OpenSans-SemiBoldItalic.ttf"),
    "OpenSans-Light": require("../assets/fonts/OpenSans-Light.ttf"),
    "OpenSans-Condensed-Regular": require("../assets/fonts/OpenSans_Condensed-Regular.ttf"),
    "OpenSans-Condensed-Bold": require("../assets/fonts/OpenSans_Condensed-Bold.ttf"),
    "OpenSans-SemiCondensed-Regular": require("../assets/fonts/OpenSans_SemiCondensed-Regular.ttf"),
    "OpenSans-SemiCondensed-Bold": require("../assets/fonts/OpenSans_SemiCondensed-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <MessageTrackerProvider>
            <ThemedRoot>
              <>
                <Slot />
                <FlashMessage
                  floating={true}
                  style={{ paddingTop: 40 }}
                  position="top"
                />
              </>
            </ThemedRoot>
          </MessageTrackerProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
