import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function StepPrivacy() {
  const params = useLocalSearchParams();
  const [allow, setAllow] = useState(false);

  return (
    <OnboardingStep
      title="Messaging Privacy"
      onNext={() =>
        router.push({
          pathname: "/(root)/(onboarding)/location",
          params: { ...params, allow_messages_from_strangers: allow },
        })
      }
    >
      <View className="items-center">
        <TouchableOpacity
          onPress={() => setAllow(!allow)}
          activeOpacity={0.8}
          className={`w-full p-6 rounded-3xl border-2 flex-row items-center justify-between ${allow ? "border-[#FD267D] bg-[#FD267D]/5" : "border-gray-200 dark:border-white/10"}`}
        >
          <View className="flex-1 pr-4">
            <Text
              className={`text-xl font-bold mb-1 ${allow ? "text-[#FD267D]" : "text-gray-400"}`}
            >
              Allow Messages from Strangers
            </Text>
            <Text className="text-gray-500 text-sm">
              If off, only people you have matched with can message you.
            </Text>
          </View>
          <MaterialCommunityIcons
            name={
              allow ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"
            }
            size={32}
            color={allow ? "#FD267D" : "#9ca3af"}
          />
        </TouchableOpacity>
      </View>
    </OnboardingStep>
  );
}
