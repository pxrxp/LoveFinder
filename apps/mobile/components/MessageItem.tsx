import { View, Text, Image, Pressable, GestureResponderEvent } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Message, User } from "@/types/chat";

interface Props {
  other_user: User | null;
  item: Message;
  onPress: (event: GestureResponderEvent) => void,
  onLongPress: (event: GestureResponderEvent) => void
}

export default function MessageItem({ other_user, item, onPress, onLongPress }: Props) {
  const isMine = item.sender_id !== other_user?.user_id;
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [item.message_id]);

  return (
    <View className={`my-2 px-1 ${isMine ? "self-end" : "self-start"}`}>
      <Pressable onPress={onPress} onLongPress={onLongPress}>
      {item.message_type === "text" ? (
        <Text
          className={`px-4 py-2 rounded-2xl text-base ${
            isMine
              ? "bg-accent text-white shadow-md"
              : "bg-bgPrimaryDark dark:bg-bgPrimaryLight text-textPrimaryDark dark:text-textPrimaryLight"
          }`}
        >
          {item.message_content}
        </Text>
      ) : (
        <View>
          <Image
            source={{ uri: item.message_content }}
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
        </View>
      )}
      </Pressable>
    </View>
  );
}
