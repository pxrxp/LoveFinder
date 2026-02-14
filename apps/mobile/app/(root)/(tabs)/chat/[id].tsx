import { View, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFetch } from "@/hooks/useFetch";
import { useEffect } from "react";
import ProfilePicture from "@/components/ProfilePicture";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";

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
  profile_picture_url: string | null;
}

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  const chat = useFetch<Message[]>(`chat/${id}`);
  const user = useFetch<User>(`users/${id}`);
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-row">
              <ProfilePicture
                url={user.data?.profile_picture_url}
                size={40}
                color={themeColors.textPrimary}
              />
              <Text className="text-textPrimaryLight dark:text-textPrimaryDark text-xl font-bold pt-2 pl-5">
                {user.data?.full_name}
              </Text>
            </View>
          ),
        }}
      />
      <SafeAreaView></SafeAreaView>
    </>
  );
}
