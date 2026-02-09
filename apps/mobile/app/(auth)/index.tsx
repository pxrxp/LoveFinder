import { Text,View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  return (
    <SafeAreaView>
      <Pressable><Text>Sign In</Text></Pressable>
    </SafeAreaView>
  );
}
