import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";

export default function StepGender() {
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState("");
  const options = ["male", "female", "nonbinary"];

  return (
    <OnboardingStep
      title="What's your gender?"
      disabled={!selected}
      onNext={() =>
        router.push({
          pathname: "/(root)/(onboarding)/orientation",
          params: { ...params, gender: selected },
        })
      }
    >
      <View className="gap-4">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setSelected(opt)}
            className={`py-5 px-6 rounded-2xl border-2 ${selected === opt ? "border-accent bg-accent/10" : "border-gray-200 dark:border-white/10"}`}
          >
            <Text
              className={`text-xl font-bold capitalize ${selected === opt ? "text-accent" : "text-gray-400"}`}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingStep>
  );
}
