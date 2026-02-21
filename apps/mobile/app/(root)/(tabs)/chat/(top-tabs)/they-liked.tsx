import { SafeAreaView } from "react-native-safe-area-context";
import ConversationsList from "@/components/ConversationsList";
import { useConversations } from "@/contexts/ConversationsContext";

export default function TheyLikedScreen() {
  const { conversations, loading, refetch, loadingMore, loadMore } =
    useConversations("they");

  return (
    <SafeAreaView
      className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      edges={["bottom"]}
    >
      <ConversationsList
        conversations={conversations}
        loading={loading}
        refetch={refetch}
        extraData={conversations}
        onLoadMore={loadMore}
        loadingMore={loadingMore}
        unswipeVisible={false}
      />
    </SafeAreaView>
  );
}
