import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";

export default function StepInterested() {
  const [selected, setSelected] = useState<string[]>([]);
  const params = useLocalSearchParams();
  const options = ["male", "female", "nonbinary"];

  const toggle = (val: string) => {
    setSelected(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  return (
    <OnboardingStep 
      title="Who are you interested in?" 
      disabled={selected.length === 0}
      onNext={() => router.push({ pathname: "/(onboarding)/interests", params: { ...params, pref_genders: selected.join(',') } })}
    >
      <View className="gap-4">
        {options.map(opt => (
          <TouchableOpacity 
            key={opt}
            onPress={() => toggle(opt)}
            className={`py-4 px-6 rounded-2xl border-2 ${selected.includes(opt) ? 'border-[#FD267D] bg-[#FD267D]/10' : 'border-gray-200 dark:border-white/10'}`}
          >
            <Text className={`text-xl font-bold capitalize ${selected.includes(opt) ? 'text-[#FD267D]' : 'text-gray-400'}`}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingStep>
  );
}
