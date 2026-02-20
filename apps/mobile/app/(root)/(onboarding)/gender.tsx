import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function StepGender() {
  const [selected, setSelected] = useState("");
  const { themeColors } = useTheme();
  const params = useLocalSearchParams();
  const options = ["male", "female", "nonbinary"];

  return (
    <OnboardingStep 
      title="What's your gender?" 
      disabled={!selected}
      onNext={() => router.push({ pathname: "/(onboarding)/orientation", params: { ...params, gender: selected } })}
    >
      <View className="gap-4">
        {options.map(opt => (
          <TouchableOpacity 
            key={opt}
            onPress={() => setSelected(opt)}
            className={`py-4 px-6 rounded-2xl border-2 ${selected === opt ? 'border-[#FD267D] bg-[#FD267D]/10' : 'border-gray-200 dark:border-white/10'}`}
          >
            <Text className={`text-xl font-bold capitalize ${selected === opt ? 'text-[#FD267D]' : 'text-gray-400'}`}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingStep>
  );
}
