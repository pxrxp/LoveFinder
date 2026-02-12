import { AuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const {theme, toggleTheme} = useTheme();
  const insets = useSafeAreaInsets();

  const {login, loading, user, logout} = useContext(AuthContext)!;
  return (
    <SafeAreaView
      className="flex-1 px-5 pt-2 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      style={{
        paddingBottom: insets.bottom + 20,
      }}
    >
      <Text>Profile</Text>
      <Pressable onPress={logout}><Text>Log out</Text></Pressable>
      <Pressable onPress={toggleTheme}><Text>Toggle theme</Text></Pressable>
    </SafeAreaView>
  );
}
