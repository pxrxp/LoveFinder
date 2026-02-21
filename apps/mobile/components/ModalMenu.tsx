import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export interface MenuAction {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onPress: () => void;
}

interface ModalMenuProps {
  title?: string;
  visible: boolean;
  onDismiss: () => void;
  actions: MenuAction[];
}

export default function ModalMenu({
  title = "Menu",
  visible,
  onDismiss,
  actions,
}: ModalMenuProps) {
  const { themeColors } = useTheme();
  const [rendered, setRendered] = useState(visible);

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withTiming(0.85, { duration: 150 }, (finished) => {
        if (finished) scheduleOnRN(setRendered, false);
      });
      opacity.value = withTiming(0, { duration: 120 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!rendered) return null;

  return (
    <Modal transparent visible animationType="none">
      <Pressable
        onPress={onDismiss}
        className="flex-1 justify-center items-center bg-black/40 px-10"
      >
        <Animated.View
          style={[
            {
              backgroundColor: themeColors.bgPrimary,
              width: "100%",
              maxWidth: 300,
            },
            animatedStyle,
          ]}
          className="rounded-3xl p-4 shadow-2xl"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View>
              {title ? (
                <Text
                  className="text-center font-bold text-lg mb-4"
                  style={{ color: themeColors.textPrimary }}
                >
                  {title}
                </Text>
              ) : null}
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onDismiss();
                    action.onPress();
                  }}
                  className="flex-row items-center p-4 rounded-2xl mb-1"
                  style={{ backgroundColor: themeColors.textPrimary + "08" }}
                >
                  <View className="mr-4">{action.icon}</View>
                  <Text
                    className="text-base font-semibold"
                    style={{ color: action.color || themeColors.textPrimary }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
