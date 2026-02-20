import React, { useState } from "react";
import { TextInput, View, Text } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";

export default function StepBio() {
  const [bio, setBio] = useState("");
  const params = useLocalSearchParams();

  return (
    <OnboardingStep 
      title="Write a bio" 
      disabled={bio.length < 10}
      onNext={() => router.push({ pathname: "/(onboarding)/location", params: { ...params, bio } })}
    >
      <TextInput
        placeholder="Tell us about yourself..."
        placeholderTextColor="#9ca3af"
        multiline
        value={bio}
        onChangeText={setBio}
        className="text-xl font-semibold bg-gray-100 dark:bg-white/5 p-6 rounded-3xl h-48 text-textPrimaryLight dark:text-textPrimaryDark"
        textAlignVertical="top"
      />
      <Text className="text-right text-gray-400 mt-2 font-bold">{bio.length}/512</Text>
    </OnboardingStep>
  );
}
