import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  useSharedValue,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

import { useFetch } from "@/hooks/useFetch";
import { FeedUser } from "@/types/FeedUser";
import Card from "@/components/Card";
import DataLoader from "@/components/DataLoader";

type SwipeStatus = "dislike" | "like" | "pending";

export default function HomeScreen() {
  const { data, loading, error, refetch } = useFetch<FeedUser[]>("feed");
  const tabBarHeight = useBottomTabBarHeight();

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
    <SafeAreaView
      className="flex-1 px-5 pt-2 pb-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      edges={["top", "left", "right"]}
      style={{ paddingBottom: tabBarHeight }}
    >
      <DataLoader fetchResult={{ data, loading, error, refetch }} pullToRefresh>
        {() => {
          return (
            <View className="flex-1 relative">
              {cards.map((item, index) => {
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
              })}
            </View>
          );
        }}
      </DataLoader>
    </SafeAreaView>
  );
}
