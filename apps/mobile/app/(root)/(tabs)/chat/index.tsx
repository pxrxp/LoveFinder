import { useFetch } from "@/hooks/useFetch";
import { Link, Stack, useFocusEffect } from "expo-router";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Entypo from "@expo/vector-icons/Entypo";
import { colors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import ProfilePicture from "@/components/ProfilePicture";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Conversation {
  other_user_id: string;
  full_name: string;
  profile_picture_url: string;
  last_message: string;
  last_message_type: "text" | "image";
  last_message_sender_id: string;
  last_message_sent_at: Date;
}

export default function ChatScreen() {
  const {
    data,
    loading: chatLoading,
    refetch,
  } = useFetch<Conversation[]>("chat");
  const { loading: userLoading, user } = useContext(AuthContext)!;
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Chats",
        }}
      />
      <SafeAreaView
        className="flex-1 px-7 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
        edges={["bottom"]}
      >
        <FlatList
          data={data}
          onRefresh={onRefresh}
          refreshing={refreshing}
          keyExtractor={(item) => item.other_user_id}
          ListEmptyComponent={
            <View className="flex-row justify-center py-10">
              <Entypo
                name="emoji-sad"
                size={64}
                color={themeColors.textPrimary}
              />
              <Text className="text-textPrimaryLight dark:text-textPrimaryDark font-bold text-2xl ml-5 mt-5">
                Nothing to see here!
              </Text>
            </View>
          }
          ListFooterComponent={<View className="w-full h-20" />}
          renderItem={({ item }) => (
            <Link href={`/chat/${item.other_user_id}`} className="my-5">
              <View className="flex-row items-center w-full">
                <ProfilePicture
                  url={item.profile_picture_url}
                  size={90}
                  color={themeColors.textPrimary}
                />

                <View className="flex-1 pl-5 py-3">
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-textPrimaryLight dark:text-textPrimaryDark font-bold text-xl"
                  >
                    {item.full_name}
                  </Text>

                  <View className="flex-row items-center w-full">
                    <Text className="text-gray-500 font-regular">
                      {dayjs(item.last_message_sent_at).fromNow()}
                    </Text>

                    <View className="flex-1" />

                    <Text className="text-textPrimaryDark font-light bg-gray-500 px-2 py-1 rounded-full">
                      {item.last_message_sender_id === user?.user_id
                        ? "Their turn"
                        : "Your turn"}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`text-gray-500 ${
                      item.last_message_type === "text"
                        ? "font-regular"
                        : "font-italic"
                    }`}
                  >
                    {item.last_message_type === "text"
                      ? item.last_message
                      : "Sent an attachment."}
                  </Text>

                  <View className="w-full h-[1.5px] bg-gray-500 relative top-3 rounded-full" />
                </View>
              </View>
            </Link>
          )}
        />
      </SafeAreaView>
    </>
  );
}
