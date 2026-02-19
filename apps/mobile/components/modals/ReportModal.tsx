import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ReportReason } from "@/services/user-actions";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (reason: ReportReason, details: string) => void;
};

export default function ReportModal({ visible, onDismiss, onSubmit }: Props) {
  const { themeColors } = useTheme();
  const [reason, setReason] = useState<ReportReason>(ReportReason.OTHER);
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!visible) {
      setReason(ReportReason.OTHER);
      setDetails("");
    }
  }, [visible]);

  const isReady = details.trim().length > 10;

  const handlePressSubmit = () => {
    if (isReady) {
      onSubmit(reason, details);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable onPress={onDismiss} className="flex-1 bg-black/60 justify-end">
        <Pressable
          className="rounded-t-3xl p-6 pb-10"
          style={{ backgroundColor: themeColors.bgPrimary, height: "80%" }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-12 h-1.5 bg-gray-600 self-center rounded-full mb-6" />

          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: themeColors.textPrimary }}
          >
            Report User
          </Text>
          <Text className="text-gray-500 mb-6">
            Select a reason and provide details (min 11 chars).
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="flex-row flex-wrap mb-6">
              {Object.entries(ReportReason).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setReason(value)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                    reason === value
                      ? "bg-accent border-accent"
                      : "border-gray-700"
                  }`}
                >
                  <Text
                    className="capitalize"
                    style={{
                      color: reason === value ? "white" : themeColors.textPrimary,
                    }}
                  >
                    {value.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              className="text-sm font-bold mb-2"
              style={{ color: themeColors.textPrimary }}
            >
              Details
            </Text>
            <TextInput
              multiline
              numberOfLines={4}
              className="rounded-2xl p-4 text-white border border-gray-700"
              style={{
                backgroundColor: themeColors.chatBg,
                textAlignVertical: "top",
                height: 120,
              }}
              placeholder="Please describe the situation..."
              placeholderTextColor="#666"
              value={details}
              onChangeText={setDetails}
            />
            <Text
              className={`text-right text-[10px] mt-1 ${
                isReady ? "text-green-500" : "text-red-400"
              }`}
            >
              {details.length}/11 characters minimum
            </Text>
          </ScrollView>

          <View className="flex-row justify-between mt-6">
            <TouchableOpacity onPress={onDismiss} className="px-6 py-3">
              <Text className="text-gray-400 font-bold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!isReady}
              className={`px-10 py-3 rounded-full ${
                isReady ? "bg-red-500" : "bg-gray-500"
              }`}
              onPress={handlePressSubmit}
            >
              <Text className="text-white font-bold">Submit Report</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
