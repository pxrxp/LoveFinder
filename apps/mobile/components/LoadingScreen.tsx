import { ActivityIndicator, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="bg-bgPrimaryLight dark:bg-bgPrimaryDark flex-1 justify-center items-center">
      <ActivityIndicator color="gray" size="large"/>
    </View>
  )
}

