import { SafeAreaView } from "react-native-safe-area-context";
import ChatList from "@/components/ChatList";
import { useChat } from "@/contexts/ChatContext";

export default function YouLikedScreen() {
  const { conversations, loading, refetch } = useChat();

  return (
    <SafeAreaView className="flex-1 px-7 bg-bgPrimaryLight dark:bg-bgPrimaryDark" edges={["bottom"]}>
      <ChatList
        conversations={conversations?.filter(c => c.swipe_category === "they") ?? []}
        unswipeVisible={false}
        loading={loading}
        refetch={refetch}
      />
    </SafeAreaView>
  );
}
