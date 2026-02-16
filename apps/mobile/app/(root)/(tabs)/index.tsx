import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

import { useFetch } from "@/hooks/useFetch";
import { FeedUser } from "@/types/FeedUser";
import Card from "@/components/Card";
import DataLoader from "@/components/DataLoader";
import { apiFetch } from "@/services/api";
import { scheduleOnRN } from "react-native-worklets";

const SCREEN_WIDTH = require("react-native").Dimensions.get("window").width;
type SwipeStatus = "dislike" | "like" | "pending";

export default function HomeScreen() {
  const { data, loading, error, refetch } = useFetch<FeedUser[]>("feed");
  const tabBarHeight = useBottomTabBarHeight();

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const status = useSharedValue<SwipeStatus>("pending");

  const [cards, setCards] = useState<FeedUser[]>([]);
  useEffect(() => {
    if (data) setCards([...data].reverse());
  }, [data]);

  const removeTopCard = () => {
    setCards((prev) => prev.slice(0, -1));
    x.value = 0;
    y.value = 0;
    status.value = "pending";
  };

  const postSwipe = async (receiver_id: string, type: "like" | "dislike") => {
    try {
      await apiFetch(`swipes/${receiver_id}/${type}`, { method: "POST" });
    } catch (err) {
      console.error("Swipe POST failed", err);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      x.value = event.translationX;
      y.value = event.translationY;
      const swipePercent = Math.abs(x.value) / SCREEN_WIDTH;
      status.value =
        swipePercent >= 0.1 ? (x.value > 0 ? "like" : "dislike") : "pending";
    })
    .onEnd(() => {
      const swipePercent = Math.abs(x.value) / SCREEN_WIDTH;
      const topCard = cards[cards.length - 1];
      const currentStatus = status.value;
      if (!topCard) return;

      if (swipePercent >= 0.1) {
        x.value = withTiming(
          Math.sign(x.value) * SCREEN_WIDTH * 1.5,
          {},
          (finished) => {
            if (finished) {
              if (currentStatus !== "pending")
                scheduleOnRN(postSwipe, topCard.user_id, currentStatus);
              scheduleOnRN(removeTopCard);
            }
          },
        );
      } else {
        status.value = "pending";
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: 1.5 * x.value },
      { translateY: 2 * y.value },
      { rotateZ: `${-0.17 * x.value}deg` },
    ],
  }));

  const showHeartStyle = useAnimatedStyle(() => ({
    opacity: status.value === "like" ? 1 : 0,
  }));
  const showCrossStyle = useAnimatedStyle(() => ({
    opacity: status.value === "dislike" ? 1 : 0,
  }));

  return (
    <SafeAreaView
      className="flex-1 px-5 pt-2 pb-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      edges={["top", "left", "right"]}
      style={{ paddingBottom: tabBarHeight }}
    >
      <DataLoader fetchResult={{ data, loading, error, refetch }} pullToRefresh>
        {(fetchedData: FeedUser[]) => {
          const cardsData = [...fetchedData].reverse();
          return (
            <View className="flex-1 relative">
              {cardsData.map((item, index) => {
                const isTop = index === cardsData.length - 1;
                return (
                  <GestureDetector
                    key={item.user_id}
                    gesture={isTop ? gesture : Gesture.Native()}
                  >
                    <Card
                      style={style}
                      showHeartStyle={showHeartStyle}
                      showCrossStyle={showCrossStyle}
                      item={item}
                      isTop={isTop}
                    />
                  </GestureDetector>
                );
              })}
            </View>
          );
        }}
      </DataLoader>
    </SafeAreaView>
  );
}
