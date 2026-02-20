import { useState } from "react";
import { TextInput } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router } from "expo-router";

export default function StepName() {
  const [name, setName] = useState("");
  return (
    <OnboardingStep 
      title="What's your name?" 
      description="This is how it will appear on LoveFinder."
      onNext={() => router.push({ pathname: "/(onboarding)/birthday", params: { name } })}
      disabled={name.length < 2}
    >
      <TextInput
        placeholder="First Name"
        placeholderTextColor="#9ca3af"
        autoFocus
        value={name}
        onChangeText={setName}
        className="text-3xl font-bold border-b-2 border-[#FD267D] pb-2 text-textPrimaryLight dark:text-textPrimaryDark"
      />
    </OnboardingStep>
  );
}
