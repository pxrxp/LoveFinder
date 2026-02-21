import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmColor?: string;
};

export default function ConfirmModal({
  visible,
  onDismiss,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  confirmColor = "#ef4444",
}: Props) {
  const { themeColors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        onPress={onDismiss}
        className="flex-1 bg-black/60 justify-center p-8"
      >
        <Pressable
          className="rounded-3xl p-6 shadow-2xl"
          style={{ backgroundColor: themeColors.bgPrimary }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            className="text-xl font-bold mb-2"
            style={{ color: themeColors.textPrimary }}
          >
            {title}
          </Text>

          <Text
            className="text-sm mb-8 leading-5"
            style={{ color: themeColors.textPrimary, opacity: 0.7 }}
          >
            {description}
          </Text>

          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity onPress={onDismiss} className="px-4 py-2">
              <Text className="text-gray-400 font-semiBold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onConfirm();
                onDismiss();
              }}
              style={{ backgroundColor: confirmColor }}
              className="px-6 py-2 rounded-full"
            >
              <Text className="text-white font-bold">{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
