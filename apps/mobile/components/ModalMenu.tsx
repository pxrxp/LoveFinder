import { JSX, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export interface MenuAction {
  label: string;
  icon?: JSX.Element;
  color?: string;
  onPress: () => void;
}

interface ModalMenuProps {
  visible: boolean;
  onDismiss: () => void;
  actions: MenuAction[];
  width?: number;
}

export default function ModalMenu({
  visible,
  onDismiss,
  actions,
}: ModalMenuProps) {
  const [rendered, setRendered] = useState(visible);

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);

      scale.value = 0.85;
      opacity.value = 0;

      scale.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });

      opacity.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      scale.value = withTiming(
        0.85,
        {
          duration: 180,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(setRendered, false);
          }
        },
      );

      opacity.value = withTiming(0, {
        duration: 160,
        easing: Easing.in(Easing.cubic),
      });
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
        className="flex-1 justify-center items-center bg-black/30"
      >
        <Animated.View
          style={[animatedStyle]}
          className="bg-bgPrimaryLight dark:bg-bgPrimaryDark rounded-2xl py-2 shadow-lg"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {actions.map((action, index) => (
              <View key={index}>
                <Pressable
                  onPress={() => {
                    action.onPress();
                    onDismiss();
                  }}
                  className="flex-row items-center px-4 py-3.5 active:opacity-60"
                >
                  {action.icon && <View className="mr-3">{action.icon}</View>}

                  <Text
                    className="text-base font-semiBold px-7 text-textPrimaryLight dark:text-textPrimaryDark"
                    style={action.color ? { color: action.color } : undefined}
                  >
                    {action.label}
                  </Text>
                </Pressable>

                {index < actions.length - 1 && (
                  <View className="h-[0.5px] mx-3 bg-black/10 dark:bg-white/10" />
                )}
              </View>
            ))}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
