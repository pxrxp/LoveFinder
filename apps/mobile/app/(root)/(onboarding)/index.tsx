import { useTheme } from "@/contexts/ThemeContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView className="flex-1 p-5 justify-center">
      <View className="flex-1 justify-center">

        <MaskedView
          maskElement={
            <MaterialCommunityIcons
              name="heart-multiple"
              style={{fontSize: 45}}
            />
          }
        >
          <LinearGradient
            colors={["#FD267D", "#FE6D58"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: 45, height: 45 }}
          />
        </MaskedView>
        <Text
          className={`pt-8 pb-1 text-4xl font-extrabold ${theme == "dark" ? "text-textPrimaryDark" : "text-textPrimaryLight"}`}
        >
          Welcome to LoveFinder.
        </Text>
        <Text
          className={`py-1 text-lg font-medium ${theme == "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
        >
          Please follow these house rules.
        </Text>
        <Text className="pt-5 font-bold text-xl">Be yourself.</Text>
        <Text
          className={`text-lg font-medium ${theme == "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
        >
          Make sure your photos, age and bio are true to who you are.
        </Text>
        <Text className="pt-5 text-xl font-bold">Stay safe.</Text>
        <Text
          className={`text-lg font-medium ${theme == "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
        >
          Don't be too quick to give out personal information.
        </Text>
        <Text className="pt-5 text-xl font-bold">Play it cool.</Text>
        <Text
          className={`text-lg font-medium ${theme == "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
        >
          Respect others and treat them as you would like to be treated.
        </Text>
        <Text className="pt-5 text-xl font-bold">Be proactive.</Text>
        <Text
          className={`text-lg font-medium ${theme == "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
        >
          Always report bad behaviour.
        </Text>
      </View>
      <View className="rounded-full m-5 py-4 px-5 bg-textPrimaryLight">
      <Pressable className="flex:1" onPress={() => router.push("/(tabs)")}>
        <Text className="font-bold text-xl text-center text-textPrimaryDark">I agree</Text>
      </Pressable>
    </View>
    </SafeAreaView>
  );
}
