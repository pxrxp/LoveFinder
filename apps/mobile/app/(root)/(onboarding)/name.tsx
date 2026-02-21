import { useState } from "react";
import { Keyboard, TextInput, View } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router } from "expo-router";

export default function StepName() {
  const [name, setName] = useState("");

  return (
    <OnboardingStep
      title="What's your name?"
      description="This is how it will appear on LoveFinder."
      onNext={() => {
        Keyboard.dismiss();
        router.push({
          pathname: "/(root)/(onboarding)/birthday",
          params: {
            name: name.trim().replace(/^./, (char) => char.toUpperCase()),
          },
        });
      }}
      disabled={name.length < 2}
    >
      <View className="w-full border-b-2 border-gray-300 dark:border-white/20 mt-10">
        <TextInput
          placeholder="First Name"
          placeholderTextColor="#9ca3af"
          autoFocus
          value={name}
          onChangeText={setName}
          className="text-4xl font-bold pb-2 text-textPrimaryLight dark:text-textPrimaryDark text-center"
        />
      </View>
    </OnboardingStep>
  );
}
