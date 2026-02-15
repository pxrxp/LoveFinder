import { useFetch } from "@/hooks/useFetch";
import { Link, Stack } from "expo-router";
import { FlatList, Image, Text, View } from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";

import Entypo from "@expo/vector-icons/Entypo";
import { colors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import ProfilePicture from "@/components/ProfilePicture";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

interface Conversation {
  other_user_id: string;
  full_name: string;
  profile_picture_url: string;
  last_message: string;
  last_message_type: "text" | "image";
  last_message_sender_id: string;
  last_message_sent_at: Date;
}

function timeAgo(past: Date | string): string {
  const pastDate = past instanceof Date ? past : new Date(past);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
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
          onRefresh={refetch}
          refreshing={chatLoading}
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
            <Link
              className="my-5 flex-row items-center w-full"
              href={`/chat/${item.other_user_id}`}
            >
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

                <View className="flex-row justify-between items-center w-[15.6rem]">
                  <Text className="text-gray-500 font-regular">
                    {timeAgo(item.last_message_sent_at)}
                  </Text>
                  <Text className="text-textPrimaryDark font-light bg-gray-500 px-2 py-1 rounded-full">
                    {item.last_message_sender_id === user?.user_id
                      ? "Their turn"
                      : "Your turn"}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`text-gray-500 ${item.last_message_type === "text" ? "font-regular" : "font-italic"}`}
                >
                  {item.last_message_type === "text"
                    ? item.last_message
                    : "Sent an attachment."}
                </Text>
                <View className="w-full h-[1.5px] bg-gray-500 relative top-3 rounded-full" />
              </View>
            </Link>
          )}
        />
      </SafeAreaView>
    </>
  );
}
