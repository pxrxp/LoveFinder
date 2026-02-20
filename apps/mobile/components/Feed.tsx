import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { FeedUser } from "@/types/FeedUser";
import Card from "@/components/Card";
import DataLoader from "@/components/DataLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { Entypo } from "@expo/vector-icons";

type SwipeStatus = "dislike" | "like" | "pending";

interface FeedProps {
  data: FeedUser[] | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export default function Feed({ data, loading, error, refetch }: FeedProps) {
  const { themeColors } = useTheme();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const status = useSharedValue<SwipeStatus>("pending");

  const [cards, setCards] = useState<FeedUser[]>([]);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    if (data) setCards([...data].reverse());
  }, [data]);

  const swapTopCard = () => {
    setCards((prev) => {
      if (prev.length < 2) return prev;
      const newCards = [...prev];
      const lastIndex = newCards.length - 1;
      newCards[lastIndex] = {
        ...newCards[lastIndex - 1],
        user_id: `${newCards[lastIndex - 1].user_id}-copy`,
      };
      return newCards;
    });
  };

  const removeTopCard = () => {
    setCards((prev) => prev.slice(0, -1));
    x.value = 0;
    y.value = 0;
    status.value = "pending";
  };

  return (
    <DataLoader fetchResult={{ data, loading, error, refetch }} pullToRefresh>
      {(_, refreshing, onRefresh) => (
        <View className="flex-1 relative">
          {cards.length === 0 && !loading ? (
            <ScrollView
              contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing ?? false}
                  onRefresh={onRefresh}
                  tintColor={themeColors.textPrimary}
                />
              }
            >
              <Entypo name="emoji-neutral" size={64} color={themeColors.textPrimary} />
              <Text className="text-textPrimaryLight dark:text-textPrimaryDark font-bold text-2xl mt-5 text-center">
                No one new around you!
              </Text>
              <Text className="text-gray-500 font-regular text-base mt-2">
                Pull down to refresh
              </Text>
            </ScrollView>
          ) : (
            cards.map((item, index) => {
              const isTop = index === cards.length - 1;
              return (
                <Card
                  key={item.user_id}
                  x={x}
                  y={y}
                  status={status}
                  item={item}
                  isTop={isTop}
                  bioExpanded={bioExpanded}
                  setBioExpanded={setBioExpanded}
                  swapTopCard={swapTopCard}
                  removeTopCard={removeTopCard}
                />
              );
            })
          )}
        </View>
      )}
    </DataLoader>
  );
}
