import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFetch } from "@/hooks/useFetch";
import { FeedUser } from "@/types/FeedUser";
import Feed from "@/components/Feed";

export default function HomeScreen() {
  const { data, loading, error, refetch } = useFetch<FeedUser[]>("feed");
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView
      className="flex-1 px-5 pt-2 pb-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      edges={["top", "left", "right"]}
      style={{ paddingBottom: tabBarHeight }}
    >
      <Feed data={data} loading={loading} error={error} refetch={refetch} />
    </SafeAreaView>
  );
}
