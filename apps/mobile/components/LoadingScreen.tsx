import { ActivityIndicator, View } from "react-native";

export default function LoadingScreen({
  hasBackground = true,
  className
}: {
  hasBackground?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`${hasBackground ? "bg-bgPrimaryLight dark:bg-bgPrimaryDark" : "bg-transparent"} flex-1 justify-center items-center ${className}`}
    >
      <ActivityIndicator color="gray" size="large" />
    </View>
  );
}
