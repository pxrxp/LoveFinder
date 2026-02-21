import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function WelcomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView className="flex-1 px-8 justify-center bg-bgPrimaryLight dark:bg-bgPrimaryDark">
        <View className="mb-4">
          <MaskedView
            maskElement={
              <MaterialCommunityIcons
                name="heart-multiple"
                style={{ fontSize: 45 }}
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
            className={`pt-8 pb-1 text-4xl font-extrabold ${theme === "dark" ? "text-textPrimaryDark" : "text-textPrimaryLight"}`}
          >
            Welcome to LoveFinder.
          </Text>

          <Text
            className={`py-1 text-lg font-regular ${theme === "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
          >
            Please follow these house rules.
          </Text>

          <Text 
            className={`pt-5 font-bold text-xl ${theme === "dark" ? "text-textPrimaryDark" : "text-textPrimaryLight"}`}
          >
            Be yourself.
          </Text>
          <Text
            className={`text-lg font-regular ${theme === "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
          >
            Make sure your photos, age and bio are true to who you are.
          </Text>

          <Text 
            className={`pt-5 text-xl font-bold ${theme === "dark" ? "text-textPrimaryDark" : "text-textPrimaryLight"}`}
          >
            Stay safe.
          </Text>
          <Text
            className={`text-lg font-regular ${theme === "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
          >
            Don't be too quick to give out personal information.
          </Text>

          <Text 
            className={`pt-5 text-xl font-bold ${theme === "dark" ? "text-textPrimaryDark" : "text-textPrimaryLight"}`}
          >
            Play it cool.
          </Text>
          <Text
            className={`text-lg font-regular ${theme === "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
          >
            Respect others and treat them as you would like to be treated.
          </Text>

          <Text 
            className={`pt-5 text-xl font-bold ${theme === "dark" ? "text-textPrimaryDark" : "text-textPrimaryLight"}`}
          >
            Be proactive.
          </Text>
          <Text
            className={`text-lg font-regular ${theme === "dark" ? "text-textSecondaryDark" : "text-textSecondaryLight"}`}
          >
            Always report bad behaviour.
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => router.push("/(root)/(onboarding)/name")}
          className="rounded-full overflow-hidden mt-6"
        >
          <LinearGradient
            colors={["#FD267D", "#FE6D58"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 px-5"
          >
            <Text className="font-bold text-xl text-center text-white">
              I agree
            </Text>
          </LinearGradient>
        </TouchableOpacity>
    </SafeAreaView>
  );
}
