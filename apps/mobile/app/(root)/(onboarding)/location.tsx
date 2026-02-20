import React, { useState } from "react";
import { View, Text } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { updateProfile } from "@/services/users";
import { addInterest } from "@/services/interests";
import { uploadFile } from "@/services/upload-media";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function StepLocation() {
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { latitude: 0, longitude: 0 };
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        coords = loc.coords;
      }

      await updateProfile({
        full_name: params.name as string,
        birth_date: params.birth_date as string,
        gender: params.gender as any,
        sexual_orientation: params.sexual_orientation as any,
        pref_genders: (params.pref_genders as string).split(',') as any,
        bio: params.bio as string,
        latitude: coords.latitude,
        longitude: coords.longitude,
        is_onboarded: true
      });

      const intIds = (params.interests as string).split(',').map(Number);
      await Promise.all(intIds.map(id => addInterest(id)));

      const photoUris = (params.uris as string).split('|');
      await Promise.all(photoUris.map((uri, i) => uploadFile({ uri, type: 'image' }, 'photos/upload', { is_primary: i === 0 })));

      router.replace("/(tabs)");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStep title="Where are you?" onNext={handleFinish} loading={loading}>
      <View className="items-center flex-1 justify-center">
        <View className="bg-[#FD267D]/10 p-10 rounded-full">
          <MaterialCommunityIcons name="map-marker-radius" size={80} color="#FD267D" />
        </View>
        <Text className="text-center text-gray-500 font-semibold mt-8 px-6 text-lg">
          We need your location to show you people nearby.
        </Text>
      </View>
    </OnboardingStep>
  );
}
