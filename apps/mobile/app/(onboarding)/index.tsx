import { Text,View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  return (
    <SafeAreaView>
      <Text className="text-red-500">Welcome to LoveFinder.</Text>
      <Text>Please follow these house rules.</Text>
      <Text>Be yourself.</Text>
      <Text>Make sure you photos, age and bio are true to who you are.</Text>
      <Text>Stay safe.</Text>
      <Text>Don't be too quick to give out personal information.</Text>
      <Text>Play it cool.</Text>
      <Text>
        Respect others and treat them as you would like to be treated.
      </Text>
      <Text>Be proactive.</Text>
      <Text>Always report bad behaviour.</Text>
      <Pressable><Text>I agree</Text></Pressable>
    </SafeAreaView>
  );
}
