import "@/global.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
