import React, { useState, useMemo } from "react";
import { View, Text } from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { WheelPicker, WheelPickerWrapper } from "@/components/WheelPicker";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function StepBirthday() {
  const params = useLocalSearchParams();
  const { themeColors } = useTheme();

  const [date, setDate] = useState(dayjs());

  const months = useMemo(
    () =>
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].map((m, i) => ({ label: m, value: i })),
    [],
  );

  const years = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => {
        const y = dayjs().year() - i;
        return { label: y.toString(), value: y };
      }),
    [],
  );

  const days = useMemo(() => {
    const count = date.daysInMonth();
    return Array.from({ length: count }, (_, i) => ({
      label: (i + 1).toString(),
      value: i + 1,
    }));
  }, [date.month(), date.year()]);

  const update = (type: "d" | "m" | "y", val: number) => {
    if (type === "m") setDate(date.month(val));
    if (type === "y") setDate(date.year(val));
    if (type === "d") setDate(date.date(val));
  };

  const isOldEnough = dayjs().diff(date, "year") >= 18;

  return (
    <OnboardingStep
      title="When's your birthday?"
      disabled={!isOldEnough}
      onNext={() =>
        router.push({
          pathname: "/(root)/(onboarding)/gender",
          params: { ...params, birth_date: date.toISOString() },
        })
      }
    >
      <View className="items-center justify-center flex-1">
        <View className="rounded-3xl py-4 px-2 w-full">
          <WheelPickerWrapper>
            <WheelPicker
              options={months}
              value={date.month()}
              onValueChange={(v) => update("m", v)}
            />
            <WheelPicker
              options={days}
              value={date.date()}
              onValueChange={(v) => update("d", v)}
            />
            <WheelPicker
              options={years}
              value={date.year()}
              onValueChange={(v) => update("y", v)}
            />
          </WheelPickerWrapper>
        </View>

        <Text
          className="mt-8 font-regular text-lg text-center"
          style={{
            color: isOldEnough ? themeColors.textSecondary : "red",
          }}
        >
          {isOldEnough
            ? "Only your age will be visible on your profile."
            : "You must be 18 years or older."}
        </Text>
      </View>
    </OnboardingStep>
  );
}
