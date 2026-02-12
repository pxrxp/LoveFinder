import { View, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFetch } from "@/hooks/useFetch";
import { useEffect } from "react";
import ProfilePicture from "@/components/ProfilePicture";

interface Message {
  is_read: boolean;
  message_content: string;
  message_id: string;
  sender_id: string;
  sent_at: string;
}

interface User {
  user_id: string;
  full_name: string;
  age: number;
  sexual_orientation: string;
  bio: string;
}

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  const chat = useFetch<Message[]>(`chat/${id}`);
  const user = useFetch<User>(`users/${id}`);
  useEffect(() => console.log(user.data), [user.data]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-row">
              <ProfilePicture url={"https://cms.ongeo-intelligence.com/uploads/medium_webp_Satellite_Image_Resolution_Low_Resolution_10m_On_Geo_Intelligence_57fe54fcca.webp"} size={40} />
              <Text className="text-textPrimaryLight dark:text-textPrimaryDark text-xl font-bold pt-2 pl-5">{user.data?.full_name}</Text>
            </View>
          ),
        }}
      />
      <SafeAreaView></SafeAreaView>
    </>
  );
}
