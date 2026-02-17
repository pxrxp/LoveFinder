import { View, Text } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ErrorScreen({error} : {error: string | null}) {
  return (
    <View className="bg-bgPrimaryLight dark:bg-bgPrimaryDark flex-1 justify-center items-center">
      <FontAwesome name="warning" size={48} color="red" className="my-5" />
      <Text className="text-l font-regular text-textPrimaryLight dark:text-textPrimaryDark">{error ?? ""}</Text>
    </View>
  )
}

