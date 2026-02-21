import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";

export default function StepOrientation() {
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState("");
  const orientations = [
    "straight",
    "gay",
    "lesbian",
    "bisexual",
    "asexual",
    "pansexual",
    "queer",
  ];

  return (
    <OnboardingStep
      title="Sexual orientation?"
      disabled={!selected}
      onNext={() =>
        router.push({
          pathname: "/(root)/(onboarding)/interested",
          params: { ...params, sexual_orientation: selected },
        })
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-10">
          {orientations.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setSelected(opt)}
              className={`py-4 px-6 rounded-full border-2 ${selected === opt ? "border-accent bg-accent/10" : "border-gray-200 dark:border-white/10"}`}
            >
              <Text
                className={`text-lg font-bold capitalize text-center ${selected === opt ? "text-accent" : "text-gray-400"}`}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </OnboardingStep>
  );
}
