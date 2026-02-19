import { FlatList, View, Pressable, Text } from "react-native";
import { Message, User } from "@/types/chat";
import MessageItem from "./MessageItem";
import { formatFriendlyDate } from "@/services/date";

type Props = {
  messages: Message[];
  otherUser: User | null;
  pressedMessage: string | null;
  setPressedMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMessage: React.Dispatch<React.SetStateAction<string | null>>;
  openDeleteMenu: () => void;
  openViewer: (uri: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function ChatMessagesList({
  messages,
  otherUser,
  pressedMessage,
  setPressedMessage,
  setSelectedMessage,
  openDeleteMenu,
  openViewer,
  refreshing = false,
  onRefresh,
}: Props) {
  return (
    <FlatList
      data={messages}
      inverted
      keyExtractor={(item) => item.message_id}
      className="px-4"
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListFooterComponent={<View className="h-12 w-full" />}
      renderItem={({ item }) => (
        <>
          {pressedMessage === item.message_id && (
            <Text
              className={`text-sm font-light pb-5 ${
                item.sender_id === otherUser?.user_id
                  ? "text-left pl-3 text-gray-200"
                  : "text-right pr-3 text-gray-200"
              }`}
            >
              Sent at {formatFriendlyDate(item.sent_at)}
            </Text>
          )}
          <MessageItem
            other_user={otherUser}
            item={item}
            openViewer={openViewer}
            onPress={(e) => {
              e.stopPropagation();
              setPressedMessage((prev) =>
                prev === item.message_id ? null : item.message_id
              );
            }}
            onLongPress={() => {
              if (item.sender_id !== otherUser?.user_id) {
                openDeleteMenu();
                setSelectedMessage(item.message_id);
              }
            }}
          />
        </>
      )}
    />
  );
}

