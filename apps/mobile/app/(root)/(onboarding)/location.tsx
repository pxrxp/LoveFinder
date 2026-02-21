import React, { useState, useContext } from "react";
import { View, Text } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { requestForegroundPermissionsAsync, getCurrentPositionAsync } from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { updateProfile } from "@/services/users";
import { addInterest } from "@/services/interests";
import { uploadFile } from "@/services/upload-media";
import { AuthContext } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function StepLocation() {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useContext(AuthContext)!;
  const { themeColors } = useTheme();
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

      await updateProfile({
        full_name: params.name as string,
        birth_date: params.birth_date as string,
        gender: params.gender as any,
        sexual_orientation: params.sexual_orientation as any,
        pref_genders: (params.pref_genders as string).split(",") as any,
        bio: params.bio as string,
        latitude: coords.latitude,
        longitude: coords.longitude,
        is_onboarded: true,
      });

      const tasks: Promise<any>[] = [];
      if (params.interests) {
        const intIds = (params.interests as string).split(",").map(Number);
        tasks.push(...intIds.map(id => addInterest(id)));
      }
      if (params.uris) {
        const photoUris = (params.uris as string).split("|");
        tasks.push(...photoUris.map((uri, i) => 
          uploadFile({ uri, type: "image" }, "photos/upload", { is_primary: i === 0 })
        ));
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
    <OnboardingStep title="Where are you?" onNext={handleFinish} loading={loading}>
      <View className="items-center justify-center flex-1">
        <MaterialCommunityIcons name="map-marker-radius" size={100} color={themeColors.textPrimary} />
        <Text className="text-center text-gray-500 font-regular mt-8 px-6 text-lg">
          We need your location to show you people nearby.
        </Text>
        <Text className="text-center text-textPrimaryLight dark:text-textPrimaryDark font-semibold mt-8 px-6 text-lg">
          This information won't be visible to other people.
        </Text>
      </View>
    </OnboardingStep>
  );
}
