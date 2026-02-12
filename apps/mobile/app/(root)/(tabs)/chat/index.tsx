import { useFetch } from "@/hooks/useFetch";
import { Link } from "expo-router";
import { FlatList, Image, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Entypo from "@expo/vector-icons/Entypo";
import { colors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import ProfilePicture from "@/components/ProfilePicture";

interface Conversation {
  full_name: string;
  profile_picture_url: string;
  receiver_id: string;
  sent_at: string;
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
  const insets = useSafeAreaInsets();
  const { data, error, loading } = useFetch<Conversation[]>("chat");
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View
      className="flex-1 px-7 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      style={{
        paddingBottom: insets.bottom + 20,
      }}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.receiver_id}
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
        renderItem={({ item }) => {
          return (
            <Link className="my-5 flex-row" href={`/chat/${item.receiver_id}`}>
              <ProfilePicture url={item.profile_picture_url} size={90} />
              <View className="flex-1 p-5">
                <Text className="text-textPrimaryLight dark:text-textPrimaryDark font-bold text-xl">
                  {item.full_name}
                </Text>
                <Text className="text-gray-400">{timeAgo(item.sent_at)}</Text>
              </View>
            </Link>
          );
        }}
      />
    </View>
  );
}
