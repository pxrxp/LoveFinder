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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

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
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.85, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        onPress={onDismiss}
        className="flex-1 bg-black/60 justify-center items-center px-6"
      >
        <Animated.View
          className="rounded-3xl p-6 shadow-2xl w-full max-h-[80%]"
          style={[{ backgroundColor: themeColors.bgPrimary }, animatedStyle]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
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
                  paddingBottom: 20,
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
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
