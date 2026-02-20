import React, { useState } from "react";
import { View, Text } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function StepBirthday() {
  const [date, setDate] = useState(dayjs().subtract(18, 'year').toDate());
  const { theme, themeColors } = useTheme();
  const params = useLocalSearchParams();

  return (
    <OnboardingStep 
      title="When's your birthday?" 
      onNext={() => router.push({ pathname: "/(onboarding)/gender", params: { ...params, birth_date: date.toISOString() } })}
    >
      <View className="items-center">
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          themeVariant={theme}
          textColor={themeColors.textPrimary}
          onChange={(_, d) => d && setDate(d)}
          maximumDate={dayjs().subtract(18, 'years').toDate()}
        />
        <Text className="text-gray-400 font-semibold mt-4">You must be at least 18 years old.</Text>
      </View>
    </OnboardingStep>
  );
}
