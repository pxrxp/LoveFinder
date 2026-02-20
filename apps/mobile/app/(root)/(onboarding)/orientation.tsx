import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";

export default function StepOrientation() {
  const [selected, setSelected] = useState("");
  const params = useLocalSearchParams();
  const orientations = ["straight", "gay", "lesbian", "bisexual", "asexual", "pansexual", "queer"];

  return (
    <OnboardingStep 
      title="Your sexual orientation?" 
      disabled={!selected}
      onNext={() => router.push({ pathname: "/(onboarding)/interested", params: { ...params, sexual_orientation: selected } })}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-10">
          {orientations.map(opt => (
            <TouchableOpacity 
              key={opt}
              onPress={() => setSelected(opt)}
              className={`py-3 px-6 rounded-full border-2 ${selected === opt ? 'border-[#FD267D] bg-[#FD267D]/10' : 'border-gray-200 dark:border-white/10'}`}
            >
              <Text className={`text-lg font-bold capitalize text-center ${selected === opt ? 'text-[#FD267D]' : 'text-gray-400'}`}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </OnboardingStep>
  );
}
