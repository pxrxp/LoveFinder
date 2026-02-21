import React, { useState, useContext } from "react";
import { View, Text } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { updateProfile } from "@/services/users";
import { addInterest } from "@/services/interests";
import { uploadFile } from "@/services/upload-media";
import { AuthContext } from "@/contexts/AuthContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function StepLocation() {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useContext(AuthContext)!;
  const { theme, themeColors } = useTheme();
  const params = useLocalSearchParams();

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { status } = await requestForegroundPermissionsAsync();
      let coords = { latitude: 0, longitude: 0 };
      if (status === "granted") {
        const loc = await getCurrentPositionAsync({});
        coords = loc.coords;
      }

      const prefGenders = (params.pref_genders as string).split(",");

      await updateProfile({
        full_name: params.name as string,
        birth_date: params.birth_date as string,
        gender: params.gender as any,
        sexual_orientation: params.sexual_orientation as any,
        pref_genders: prefGenders,
        bio: (params.bio as string) || "",
        pref_min_age: Number(params.pref_min_age),
        pref_max_age: Number(params.pref_max_age),
        pref_distance_radius_km: Number(params.pref_distance_radius_km),
        allow_messages_from_strangers:
          params.allow_messages_from_strangers === "true",
        latitude: coords.latitude,
        longitude: coords.longitude,
        is_onboarded: true,
      });

      const tasks: Promise<any>[] = [];
      if (params.interests) {
        const intIds = (params.interests as string).split(",").map(Number);
        tasks.push(...intIds.map((id) => addInterest(id)));
      }
      if (params.uris) {
        const photoUris = (params.uris as string).split("|");
        tasks.push(
          ...photoUris.map((uri, i) =>
            uploadFile({ uri, type: "image" }, "photos/upload", {
              is_primary: i === 0,
            }),
          ),
        );
      }

      await Promise.all(tasks);
      refreshUser();
      router.replace("/(root)/(tabs)");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStep
      title="Where are you?"
      onNext={handleFinish}
      loading={loading}
    >
      <View className="flex-1 items-center">
        <MaterialCommunityIcons
          name="map-marker-radius"
          size={100}
          color={themeColors.textPrimary}
          style={{ paddingTop: 20 }}
        />
        <Text className="text-center text-gray-500 font-regular mt-8 px-6 text-lg">
          We need your location to show you people nearby.
        </Text>
        <View className="justify-between flex-1">
          <View className="flex-1" />
          <View className="flex-row items-center py-12 px-12">
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={theme === "light" ? "green" : "lightgreen"}
            />
            <Text className="text-green-500 font-bold ml-6 text-lg">
              It won{"'"}t be visible to others.
            </Text>
          </View>
        </View>
      </View>
    </OnboardingStep>
  );
}
