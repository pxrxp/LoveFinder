import { useFetch } from "@/hooks/useFetch";
import {
  ActivityIndicator,
  Text,
  View,
  Dimensions,
  ImageBackground,
  StyleSheet,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { scheduleOnRN } from "react-native-worklets";
import { apiFetch } from "@/services/api";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type SwipeStatus = "dislike" | "like" | "pending";
interface FeedUser {
  user_id: string;
  full_name: string;
  age: number;
  bio: string;
  image_url: string;
  allow_messages_from_strangers: boolean;
}

const Card = ({ style, showHeartStyle, showCrossStyle, item, isTop }: any) => (
  <Animated.View
    style={[
      {
        position: "absolute",
        inset: 0,
      },
      isTop ? style : { zIndex: -1 },
    ]}
  >
    <ImageBackground
      source={{ uri: item.image_url }}
      className="flex-1 justify-end p-5 rounded-3xl overflow-hidden"
    >
      {isTop && (
        <>
          <Animated.View
            style={[
              { position: "absolute", top: 30, left: 30 },
              showHeartStyle,
            ]}
          >
            <MaskedView
              style={{ transform: [{ rotateZ: "-20deg" }] }}
              maskElement={<AntDesign name="heart" size={100} color="white" />}
            >
              <LinearGradient
                colors={["#2EB62C", "#C5E8B7"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ width: 100, height: 100 }}
              />
            </MaskedView>
          </Animated.View>

          <Animated.View
            style={[
              { position: "absolute", top: 25, right: 30 },
              showCrossStyle,
            ]}
          >
            <MaskedView
              style={{ transform: [{ rotateZ: "20deg" }] }}
              maskElement={<Entypo name="cross" size={125} color="white" />}
            >
              <LinearGradient
                colors={["#FD267D", "#FE6D58"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ width: 125, height: 125 }}
              />
            </MaskedView>
          </Animated.View>
        </>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={{ ...StyleSheet.absoluteFillObject }}
      />

      <View className="flex-row">
        <Text className="text-white text-3xl font-bold">{item.full_name} </Text>
        <Text className="text-white text-3xl font-regular"> {item.age}</Text>
      </View>
      <Text className="text-white text-base font-regular">{item.bio}</Text>
    </ImageBackground>
  </Animated.View>
);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, loading } = useFetch<FeedUser[]>("feed");
  const [cards, setCards] = useState<FeedUser[]>([]);

  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    if (data) setCards([...data].reverse());
  }, [data]);

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const status = useSharedValue<SwipeStatus>("pending");

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
      if (swipePercent >= 0.1) {
        status.value = x.value > 0 ? "like" : "dislike";
      } else {
        status.value = "pending";
      }
    })
    .onEnd(() => {
      const swipePercent = Math.abs(x.value) / SCREEN_WIDTH;
      const topCard = cards[cards.length - 1];
      if (!topCard) return;

      if (swipePercent >= 0.1) {
        x.value = withTiming(
          Math.sign(x.value) * SCREEN_WIDTH * 1.5,
          {},
          (finished) => {
            if (finished) {
              if (status.value !== "pending") {
                scheduleOnRN(postSwipe, topCard.user_id, status.value);
              }
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

  if (loading) return <ActivityIndicator size="large" className="flex-1" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <SafeAreaView
      className="flex-1 px-5 pt-2 pb-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark"
      edges={["top", "left", "right"]}
       style={{paddingBottom: tabBarHeight}}
    >
      <View className="flex-1 relative">
        {cards.map((item, index) => {
          const isTop = index === cards.length - 1;
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
    </SafeAreaView>
  );
}
