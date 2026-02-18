import { View, Text, Pressable, GestureResponderEvent } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Message, User } from "@/types/chat";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";

interface Props {
  other_user: User | null;
  item: Message;
  openViewer: (image_uri: string) => void;
  onPress: (event: GestureResponderEvent) => void;
  onLongPress: (event: GestureResponderEvent) => void;
}

export default function MessageItem({
  other_user,
  item,
  openViewer,
  onPress,
  onLongPress,
}: Props) {
  const isMine = item.sender_id !== other_user?.user_id;
  const [failed, setFailed] = useState(false);

  const { theme } = useTheme();

  useEffect(() => setFailed(false), [item.message_id]);

  return (
    <View className={`my-2 px-1 ${isMine ? "self-end" : "self-start"}`}>
      <Pressable onPress={onPress} onLongPress={onLongPress}>
        {item.message_type === "text" ? (
          <View
            className={`max-w-52 px-2 items-end flex-row-reverse rounded-2xl ${isMine ? "bg-accent shadow-md" : "bg-bgPrimaryDark dark:bg-bgPrimaryLight"}`}
          >
            {item.is_read && (
              <Ionicons
                name="checkmark-done-sharp"
                size={18}
                color={
                  isMine
                    ? "white"
                    : theme === "dark"
                      ? colors.light.textPrimary
                      : colors.dark.textPrimary
                }
              />
            )}
            <Text
              className={`px-2 py-2 text-base ${
                isMine
                  ? "text-white"
                  : "text-textPrimaryDark dark:text-textPrimaryLight"
              }`}
            >
              {item.message_content}
            </Text>
          </View>
        ) : (
          <View>
            <Pressable
              onPress={() => !failed && openViewer(item.message_content)}
            >
              <Image
                source={{ uri: item.message_content }}
                style={{
                  borderRadius: 12,
                  width: failed ? 56 : 256,
                  height: failed ? 56 : 256,
                }}
                className={`${failed ? "w-14 h-14" : "w-64 h-64"} rounded-xl`}
                onError={() => setFailed(true)}
              />
              {failed && (
                <MaterialIcons
                  name="image-not-supported"
                  size={50}
                  color="gray"
                  style={{ position: "absolute" }}
                />
              )}
            </Pressable>
          </View>
        )}
      </Pressable>
    </View>
  );
}
