import { View, Text } from "react-native";

export default function ErrorScreen({error} : {error: string | null}) {
  return (
    <View className="bg-bgPrimaryLight dark:bg-bgPrimaryDark flex-1 justify-center items-center">
      <Text>{error ?? ""}</Text>
    </View>
  )
}

