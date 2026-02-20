import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { AntDesign } from "@expo/vector-icons";
import { pickMedia } from "@/services/media-picker";
import { router, useLocalSearchParams } from "expo-router";

export default function StepPhotos() {
  const [uris, setUris] = useState<(string | null)[]>(Array(6).fill(null));
  const params = useLocalSearchParams();

  const handlePick = async (idx: number) => {
    const res = await pickMedia({ allowsEditing: true });
    if (res) {
      const newUris = [...uris];
      newUris[idx] = res.uri;
      setUris(newUris);
    }
  };

  const count = uris.filter(x => !!x).length;

  return (
    <OnboardingStep 
      title="Add your photos" 
      description="Add at least 2 photos to continue."
      disabled={count < 2}
      onNext={() => router.push({ pathname: "/(onboarding)/bio", params: { ...params, uris: uris.filter(x => !!x).join('|') } })}
    >
      <View className="flex-row flex-wrap justify-between">
        {uris.map((uri, i) => (
          <TouchableOpacity 
            key={i} 
            onPress={() => handlePick(i)}
            style={{ width: '31%', aspectRatio: 0.7 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl mb-4 border-2 border-dashed border-gray-300 dark:border-white/10 overflow-hidden items-center justify-center"
          >
            {uri ? (
              <Image source={{ uri }} className="w-full h-full" />
            ) : (
              <AntDesign name="plus" size={24} color="#FD267D" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingStep>
  );
}
