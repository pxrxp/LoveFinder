import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import OnboardingStep from "@/components/OnboardingStep";
import { router, useLocalSearchParams } from "expo-router";
import { getAllApprovedInterests } from "@/services/interests";

export default function StepInterests() {
  const params = useLocalSearchParams();
  const [all, setAll] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllApprovedInterests()
      .then((res) => res.json())
      .then((data) => {
        setAll(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <OnboardingStep
      title="What are you into?"
      description="Pick at least 3 things you love."
      disabled={selected.length < 3}
      onNext={() =>
        router.push({
          pathname: "/(root)/(onboarding)/photos",
          params: { ...params, interests: selected.join(",") },
        })
      }
    >
      {loading ? (
        <ActivityIndicator size="large" color="#FD267D" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2 pb-10 justify-center">
            {all.map((item) => (
              <TouchableOpacity
                key={item.interest_id}
                onPress={() => toggle(item.interest_id)}
                className={`px-5 py-2 rounded-full border-2 ${selected.includes(item.interest_id) ? "bg-accent border-accent" : "border-gray-200 dark:border-white/10"}`}
              >
                <Text
                  className={`font-bold ${selected.includes(item.interest_id) ? "text-white" : "text-gray-400"}`}
                >
                  {item.interest_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </OnboardingStep>
  );
}
