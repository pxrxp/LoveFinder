import { View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function ErrorScreen({
  error,
  hasBackground = true,
  className
}: {
  error: string | null;
  hasBackground?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`${hasBackground ? "bg-bgPrimaryLight dark:bg-bgPrimaryDark" : "bg-transparent"} flex-1 justify-center items-center ${className}`}
    >
      <FontAwesome name="warning" size={48} color="red" className="my-5" />
      <Text className="text-l font-regular text-textPrimaryLight dark:text-textPrimaryDark">
        {error ?? ""}
      </Text>
    </View>
  );
}
