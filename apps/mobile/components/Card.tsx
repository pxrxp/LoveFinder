import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  SlideInDown,
  SlideOutDown,
  useAnimatedScrollHandler,
  SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FeedUser } from "@/types/FeedUser";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FontAwesome5,
  Entypo,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Image } from "expo-image";
import ReportModal from "./modals/ReportModal";
import { reportUser, swipeUser } from "@/services/user-actions";
import { showThemedError } from "@/services/themed-error";
import { showThemedSuccess } from "@/services/themed-success";
import { ImageCarousel } from "./ImageCarousel";
import { scheduleOnRN } from "react-native-worklets";
import { useFetch } from "@/hooks/useFetch";

const SCREEN_WIDTH = require("react-native").Dimensions.get("window").width;
type SwipeStatus = "dislike" | "like" | "pending";

interface Photo {
  photo_id: string;
  uploader_id: string;
  image_url: string;
  is_primary: boolean;
}

interface CardProps {
  item: FeedUser;
  isTop: boolean;
  bioExpanded: boolean;
  setBioExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  status: SharedValue<SwipeStatus>;
  removeTopCard: () => void;
  swapTopCard: () => void;
}

export default function Card({
  item,
  isTop,
  bioExpanded,
  setBioExpanded,
  x,
  y,
  status,
  removeTopCard,
  swapTopCard,
}: CardProps) {
  const { themeColors } = useTheme();
  const [reportMenuVisible, setReportMenuVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cleanUserId = item.user_id.replace("-copy", "");
  const { data: userPhotos, error } = useFetch<Photo[]>(
    `photos/${cleanUserId}`,
  );
  const [photos, setPhotos] = useState<string[]>([item.image_url]);

  const postSwipe = async (receiver_id: string, type: "like" | "dislike") => {
    try {
      await swipeUser(receiver_id, type);
    } catch (err) {
      showThemedError(`Swipe POST failed:\n ${err}`, themeColors);
    }
  };

  useEffect(() => {
    if (userPhotos?.length) setPhotos(userPhotos.map((p) => p.image_url));
    if (error) showThemedError(`Failed to fetch photos\n${error}`, themeColors);
  }, [userPhotos, error]);

  const scrollY = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const expandActivationY = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const rotateY = useSharedValue(0);
  const wobble = (direction: "left" | "right") => {
    const deg = direction === "left" ? 10 : -10;
    rotateY.value = withSequence(
      withTiming(deg, { duration: 40 }),
      withSpring(0, { damping: 40, stiffness: 1200 }),
    );
  };

  const animatedWobble = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY.value}deg` }],
  }));

  const verticalSwipe = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .failOffsetX([-10, 10])
    .onBegin((event) => {
      gestureStartY.value = event.y;
    })
    .onEnd((event) => {
      const swipeUp = event.translationY < -80;
      const swipeDown = event.translationY > 80;
      const startedInBottomArea =
        gestureStartY.value >= expandActivationY.value;

      if (swipeUp && !bioExpanded && startedInBottomArea) {
        scheduleOnRN(setBioExpanded, true);
        return;
      }

      if (swipeDown && bioExpanded && scrollY.value <= 0) {
        scheduleOnRN(setBioExpanded, false);
      }
    });

  const horizontalSwipe = Gesture.Pan()
    .enabled(isTop && !bioExpanded)
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      x.value = event.translationX;
      y.value = event.translationY * 0.1;
      const swipePercent = Math.abs(x.value) / SCREEN_WIDTH;
      status.value =
        swipePercent >= 0.1 ? (x.value > 0 ? "like" : "dislike") : "pending";
    })
    .onEnd(() => {
      const swipePercent = Math.abs(x.value) / SCREEN_WIDTH;
      const currentStatus = status.value;

      if (swipePercent >= 0.1) {
        scheduleOnRN(swapTopCard);

        x.value = withTiming(
          Math.sign(x.value) * SCREEN_WIDTH * 1.5,
          {},
          (finished) => {
            if (finished) {
              if (currentStatus !== "pending")
                scheduleOnRN(postSwipe, item.user_id, currentStatus);
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

  const combinedGesture = Gesture.Race(verticalSwipe, horizontalSwipe);

  if (photos.length === 0) return null;

  return (
    <>
      <ReportModal
        visible={reportMenuVisible}
        onDismiss={() => setReportMenuVisible(false)}
        onSubmit={(reason, details) => {
          try {
            reportUser(item.user_id, reason, details);
            setReportMenuVisible(false);
            showThemedSuccess("Reported", themeColors);
          } catch (e: any) {
            showThemedError(e, themeColors);
          }
        }}
      />

      <GestureDetector gesture={combinedGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              overflow: "hidden",
            },
            isTop ? style : { zIndex: -1 },
            animatedWobble,
          ]}
        >
          <ImageCarousel
            images={photos}
            currentIndex={currentIndex}
            onNext={() => {
              setCurrentIndex((p) => Math.min(p + 1, photos.length - 1));
              wobble("right");
            }}
            onPrev={() => {
              setCurrentIndex((p) => Math.max(p - 1, 0));
              wobble("left");
            }}
          />

          {isTop && !bioExpanded && (
            <>
              <Animated.View
                style={[
                  { position: "absolute", top: 60, left: 30, zIndex: 40 },
                  showHeartStyle,
                ]}
                pointerEvents="none"
              >
                <MaskedView
                  style={{ transform: [{ rotateZ: "-20deg" }] }}
                  maskElement={
                    <AntDesign name="heart" size={100} color="white" />
                  }
                >
                  <LinearGradient
                    colors={["#2EB62C", "#C5E8B7"]}
                    style={{ width: 100, height: 100 }}
                  />
                </MaskedView>
              </Animated.View>

              <Animated.View
                style={[
                  { position: "absolute", top: 55, right: 30, zIndex: 40 },
                  showCrossStyle,
                ]}
                pointerEvents="none"
              >
                <MaskedView
                  style={{ transform: [{ rotateZ: "20deg" }] }}
                  maskElement={<Entypo name="cross" size={125} color="white" />}
                >
                  <LinearGradient
                    colors={["#FD267D", "#FE6D58"]}
                    style={{ width: 125, height: 125 }}
                  />
                </MaskedView>
              </Animated.View>
            </>
          )}

          {!bioExpanded && (
            <View className="absolute top-4 w-full flex-row justify-center gap-3 px-4">
              {photos.map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 flex-1 rounded-full overflow-hidden ${
                    index === currentIndex ? "bg-white" : "bg-gray-500/80"
                  }`}
                />
              ))}
            </View>
          )}

          {!bioExpanded && (
            <View
              className="absolute inset-0 justify-end"
              onLayout={(e) => {
                expandActivationY.value = e.nativeEvent.layout.y;
              }}
              pointerEvents="box-none"
            >
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.85)"]}
                className="absolute inset-0"
                pointerEvents="none"
              />
              <View
                className="py-8 px-5 flex-row items-end justify-between"
                pointerEvents="box-none"
              >
                <View className="flex-1 mr-4" pointerEvents="none">
                  <View className="flex-row items-baseline">
                    <Text className="text-white text-3xl font-bold">
                      {item.full_name}{"  "}
                    </Text>
                    <Text className="text-white text-2xl font-regular">
                      {item.age}
                    </Text>
                  </View>
                  <Text
                    className="text-white text-base font-regular mt-1"
                    numberOfLines={2}
                  >
                    {item.bio?.replace(/\n/g, "\n")}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setBioExpanded(true)}
                  className="bg-black/30 p-2.5 mb-3 rounded-full border border-white/10"
                >
                  <MaterialIcons
                    name="keyboard-arrow-up"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {bioExpanded && (
            <Animated.View
              entering={SlideInDown.duration(400)}
              exiting={SlideOutDown.duration(300)}
              className="absolute inset-0 z-[100] justify-center"
            >
              <Image
                source={{ uri: photos[currentIndex] }}
                blurRadius={60}
                className="absolute inset-0"
              />
              <View className="absolute inset-0 bg-black/80" />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setBioExpanded(false)}
                className="absolute top-10 right-4 z-[110] bg-black/30 p-2.5 rounded-full border border-white/10"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View className="px-8 flex-1 mt-20">
                <Text className="text-white text-4xl font-bold mb-4">
                  {item.full_name}, {item.age}
                </Text>
                <Animated.ScrollView
                  onScroll={scrollHandler}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 80 }}
                >
                  <Text className="text-white text-xl leading-8 font-regular">
                    {item.bio?.replace(/\n/g, "\n")}
                  </Text>
                  <View className="h-20" />
                </Animated.ScrollView>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </>
  );
}
