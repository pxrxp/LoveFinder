import React, { useState } from "react";
import { View, Text } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function StepDiscovery() {
  const params = useLocalSearchParams();
  const { themeColors } = useTheme();

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(30);
  const [distance, setDistance] = useState(50);

  return (
    <OnboardingStep
      title="Discovery Settings"
      description="Who should we show you?"
      onNext={() =>
        router.push({
          pathname: "/(root)/(onboarding)/privacy",
          params: {
            ...params,
            pref_min_age: minAge,
            pref_max_age: maxAge,
            pref_distance_radius_km: distance,
          },
        })
      }
    >
      <View className="gap-10">
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400 font-bold uppercase">Age Range</Text>
            <Text className="text-[#FD267D] font-bold">
              {minAge} - {maxAge}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mb-4">Min Age: {minAge}</Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={18}
            maximumValue={100}
            step={1}
            value={minAge}
            onValueChange={setMinAge}
            minimumTrackTintColor="#FD267D"
            maximumTrackTintColor={themeColors.textPrimary + "20"}
            thumbTintColor="#FD267D"
          />
          <Text className="text-sm text-gray-500 mt-2 mb-4">
            Max Age: {maxAge}
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={minAge} // Max age cannot be lower than min age
            maximumValue={100}
            step={1}
            value={maxAge}
            onValueChange={setMaxAge}
            minimumTrackTintColor="#FD267D"
            maximumTrackTintColor={themeColors.textPrimary + "20"}
            thumbTintColor="#FD267D"
          />
        </View>

        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400 font-bold uppercase">
              Max Distance
            </Text>
            <Text className="text-accent font-bold">{distance} km</Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={100}
            step={1}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor="#FD267D"
            maximumTrackTintColor={themeColors.textPrimary + "20"}
            thumbTintColor="#FD267D"
          />
        </View>
      </View>
    </OnboardingStep>
  );
}
