import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Message } from "@/types/Message";
import { User } from "@/types/User";
import MessageItem from "@/components/MessageItem";
import { formatFriendlyDate } from "@/services/date";
import LoadingScreen from "@/components/LoadingScreen";

type Props = {
  messages: Message[];
  otherUser: User | null;
  pressedMessage: string | null;
  setPressedMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMessage: React.Dispatch<React.SetStateAction<string | null>>;
  openDeleteMenu: () => void;
  loadOlderMessages: () => void;
  loadingOlderMessages: boolean;
};

export default function ChatMessagesList({
  messages,
  otherUser,
  pressedMessage,
  setPressedMessage,
  setSelectedMessage,
  openDeleteMenu,
  loadOlderMessages,
  loadingOlderMessages,
}: Props) {
  return (
    <FlashList
      data={messages}
      maintainVisibleContentPosition={{
        autoscrollToBottomThreshold: 0.1,
        startRenderingFromBottom: true,
      }}
      onStartReached={loadOlderMessages}
      onStartReachedThreshold={0.1}
      drawDistance={1000}
      keyExtractor={(item) => item.message_id}
      className="px-4"
      ListHeaderComponent={
        loadingOlderMessages ? (
          <LoadingScreen hasBackground={false} className="p-4" />
        ) : (
          <View className="h-12 w-full" />
        )
      }
      renderItem={({ item }) => (
        <>
          <MessageItem
            other_user={otherUser}
            item={item}
            onPress={(e) => {
              e.stopPropagation();
              setPressedMessage((prev) =>
                prev === item.message_id ? null : item.message_id,
              );
            }}
            onLongPress={() => {
              if (item.sender_id !== otherUser?.user_id) {
                openDeleteMenu();
                setSelectedMessage(item.message_id);
              }
            }}
          />
          {pressedMessage === item.message_id && (
            <Text
              className={`text-sm font-regular pb-5 text-gray-500 ${
                item.sender_id === otherUser?.user_id
                  ? "text-left pl-3"
                  : "text-right pr-3"
              }`}
            >
              Sent at {formatFriendlyDate(item.sent_at)}
            </Text>
          )}
        </>
      )}
    />
  );
}
