import { SafeAreaView } from "react-native-safe-area-context";
import ConversationsList from "@/components/ConversationsList";
import { useConversations } from "@/contexts/ConversationsContext";

export default function YouLikedScreen() {
  const { conversations, loading, refetch } = useConversations();

  return (
    <SafeAreaView
      className="flex-1 px-7 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      edges={["bottom"]}
    >
      <ConversationsList
        conversations={
          conversations?.filter((c) => c.swipe_category === "they") ?? []
        }
        unswipeVisible={false}
        loading={loading}
        refetch={refetch}
        extraData={conversations}
      />
    </SafeAreaView>
  );
}
