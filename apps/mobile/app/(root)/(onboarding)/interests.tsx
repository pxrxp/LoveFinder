import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";
import { getAllApprovedInterests } from "@/services/interests";

export default function StepInterests() {
  const [all, setAll] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const params = useLocalSearchParams();

  useEffect(() => {
    getAllApprovedInterests().then(res => res.json()).then(setAll);
  }, []);

  const toggle = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <OnboardingStep 
      title="What are you into?" 
      description="Pick at least 3 things you love."
      disabled={selected.length < 3}
      onNext={() => router.push({ pathname: "/(onboarding)/photos", params: { ...params, interests: selected.join(',') } })}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-2 pb-10">
          {all.map(item => (
            <TouchableOpacity 
              key={item.id}
              onPress={() => toggle(item.id)}
              className={`px-5 py-2 rounded-full border-2 ${selected.includes(item.id) ? 'bg-[#FD267D] border-[#FD267D]' : 'border-gray-200 dark:border-white/10'}`}
            >
              <Text className={`font-bold ${selected.includes(item.id) ? 'text-white' : 'text-gray-400'}`}>{item.interest_name || item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </OnboardingStep>
  );
}
