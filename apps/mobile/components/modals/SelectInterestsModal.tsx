import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { AntDesign } from "@expo/vector-icons";

type InterestType = {
  id?: number;
  interest_id?: number;
  interest_name?: string;
  name?: string;
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
  allInterests: InterestType[];
  selectedInterests: InterestType[];
  toggleInterest: (interest: InterestType) => void;
};

const getIntId = (i: InterestType) => i.id ?? i.interest_id;
const getIntName = (i: InterestType) => i.interest_name || i.name || "Unknown";

export default function SelectInterestsModal({
  visible,
  onDismiss,
  allInterests,
  selectedInterests,
  toggleInterest,
}: Props) {
  const { themeColors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable onPress={onDismiss} className="flex-1 bg-black/60 justify-end">
        <Pressable
          className="rounded-t-3xl p-6 shadow-2xl h-[65%]"
          style={{ backgroundColor: themeColors.bgPrimary }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text
              className="text-xl font-bold"
              style={{ color: themeColors.textPrimary }}
            >
              Select Interests
            </Text>
            <TouchableOpacity onPress={onDismiss} className="p-2 -mr-2">
              <AntDesign
                name="close"
                size={24}
                color={themeColors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                paddingBottom: 40,
              }}
            >
              {allInterests.map((interest, index) => {
                const iId = getIntId(interest);
                const isSelected = selectedInterests.some(
                  (i) => getIntId(i) === iId,
                );
                const name = getIntName(interest);

                return (
                  <TouchableOpacity
                    key={`modal-int-${iId ?? index}`}
                    onPress={() => toggleInterest(interest)}
                    className="px-6 py-3 rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? themeColors.textPrimary
                        : themeColors.textPrimary + "15",
                    }}
                  >
                    <Text
                      className="font-semibold text-sm"
                      style={{
                        color: isSelected
                          ? themeColors.bgPrimary
                          : themeColors.textPrimary,
                      }}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
