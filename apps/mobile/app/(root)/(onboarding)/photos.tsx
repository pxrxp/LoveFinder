import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { AntDesign } from "@expo/vector-icons";
import { launchCamera, pickMedia } from "@/services/media-picker";
import { router, useLocalSearchParams } from "expo-router";
import MediaMenuModal from "@/components/modals/MediaMenuModal";

export default function StepPhotos() {
  const params = useLocalSearchParams();
  const [uris, setUris] = useState<(string | null)[]>(Array(6).fill(null));
  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateUri = (uri: string) => {
    const newUris = [...uris];
    newUris[activeIndex] = uri;
    setUris(newUris);
    setMediaMenuVisible(false);
  };

  const count = uris.filter(Boolean).length;

  return (
    <>
      <OnboardingStep
        title="Add your photos"
        description="Add at least 2 photos to continue."
        disabled={count < 2}
        onNext={() =>
          router.push({
            pathname: "/(root)/(onboarding)/bio",
            params: { ...params, uris: uris.filter(Boolean).join("|") },
          })
        }
      >
        <View className="flex-row flex-wrap justify-between">
          {uris.map((uri, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setActiveIndex(i);
                setMediaMenuVisible(true);
              }}
              style={{ width: "31%", aspectRatio: 0.75 }}
              className="bg-gray-100 dark:bg-white/5 rounded-2xl mb-4 border-2 border-dashed border-gray-300 dark:border-white/10 overflow-hidden items-center justify-center"
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

      <MediaMenuModal
        visible={mediaMenuVisible}
        onDismiss={() => setMediaMenuVisible(false)}
        launchCamera={async () => {
          const res = await launchCamera({ videosAllowed: false });
          if (res) updateUri(res.uri);
        }}
        pickPhoto={async () => {
          const res = await pickMedia();
          if (res) updateUri(res.uri);
        }}
        hideAudioRecorderAction
      />
    </>
  );
}
