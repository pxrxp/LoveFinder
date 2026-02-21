import React, { useState } from "react";
import { TextInput, Text, Keyboard } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";

export default function StepBio() {
  const params = useLocalSearchParams();
  const [bio, setBio] = useState("");

  return (
    <OnboardingStep
      title="Write a bio"
      description="Tell the world who you are."
      disabled={bio.length < 10}
      onNext={() => {
        Keyboard.dismiss();
        router.push({
          pathname: "/(root)/(onboarding)/discovery",
          params: { ...params, bio },
        });
      }}
    >
      <TextInput
        placeholder="Tell us about yourself..."
        placeholderTextColor="#9ca3af"
        multiline
        autoFocus
        value={bio}
        onChangeText={setBio}
        maxLength={512}
        className="text-xl font-semibold bg-gray-100 dark:bg-white/5 p-6 rounded-3xl h-36 text-textPrimaryLight dark:text-textPrimaryDark"
        textAlignVertical="top"
      />
      <Text className="text-right text-gray-400 mt-2 font-bold">
        {bio.length}/512
      </Text>
    </OnboardingStep>
  );
}
