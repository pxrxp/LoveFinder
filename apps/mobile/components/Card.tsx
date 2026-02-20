import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  AntDesign,
  FontAwesome5,
  Entypo,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useMemo } from "react";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { reportUser, swipeUser } from "@/services/user-actions";
import { showThemedError } from "@/services/themed-error";
import { showThemedSuccess } from "@/services/themed-success";
import { ImageCarousel } from "@/components/ImageCarousel";
import ReportModal from "@/components/modals/ReportModal";
import { useFetch } from "@/hooks/useFetch";
import { User } from "@/types/User";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CardProps {
  item: User;
  isTop: boolean;
  bioExpanded: boolean;
  setBioExpanded: (val: boolean) => void;
  onRemove: () => void;
}

export default function Card({
  item,
  isTop,
  bioExpanded,
  setBioExpanded,
  onRemove,
}: CardProps) {
  const { themeColors } = useTheme();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const [status, setStatus] = useState<"like" | "dislike" | "pending">(
    "pending",
  );
  const [reportMenuVisible, setReportMenuVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: userPhotos } = useFetch<any[]>(
    `photos/${item.user_id.replace("-copy", "")}`,
  );
  const photos = useMemo(
    () =>
      userPhotos?.length
        ? userPhotos.map((p) => p.image_url)
        : [item.image_url],
    [userPhotos, item.image_url],
  );

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value * 2 },
      { rotateZ: `${-0.17 * x.value}deg` },
    ],
    zIndex: isTop ? 10 : 1,
  }));

  const animatedWobble = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY.value}deg` }],
  }));

  const horizontalSwipe = Gesture.Pan()
    .runOnJS(true)
    .enabled(isTop && !bioExpanded)
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY * 0.1;
      const perc = Math.abs(x.value) / SCREEN_WIDTH;
      if (perc >= 0.1) setStatus(x.value > 0 ? "like" : "dislike");
      else setStatus("pending");
    })
    .onEnd(() => {
      if (Math.abs(x.value) / SCREEN_WIDTH >= 0.1) {
        const finalDir = x.value > 0 ? "like" : "dislike";
        swipeUser(item.user_id, finalDir).catch(() => {});
        x.value = withTiming(Math.sign(x.value) * SCREEN_WIDTH * 1.5, {
          duration: 250,
        });
        setTimeout(onRemove, 250);
      } else {
        setStatus("pending");
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const verticalSwipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationY < -80 && !bioExpanded) setBioExpanded(true);
      else if (e.translationY > 80 && bioExpanded) setBioExpanded(false);
    });

  return (
    <>
      <ReportModal
        visible={reportMenuVisible}
        onDismiss={() => setReportMenuVisible(false)}
        onSubmit={(r, d) => {
          reportUser(item.user_id, r, d)
            .then(() => {
              setReportMenuVisible(false);
              showThemedSuccess("Reported", themeColors);
            })
            .catch((e) => showThemedError(e.message, themeColors));
        }}
      />

      <GestureDetector gesture={Gesture.Race(verticalSwipe, horizontalSwipe)}>
        <Animated.View
          style={[
            {
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              overflow: "hidden",
            },
            style,
            animatedWobble,
          ]}
        >
          <ImageCarousel
            images={photos}
            currentIndex={currentIndex}
            onNext={() => {
              setCurrentIndex((p) => Math.min(p + 1, photos.length - 1));
              rotateY.value = withSequence(
                withTiming(-10, { duration: 40 }),
                withSpring(0, { damping: 40, stiffness: 1200 }),
              );
            }}
            onPrev={() => {
              setCurrentIndex((p) => Math.max(p - 1, 0));
              rotateY.value = withSequence(
                withTiming(10, { duration: 40 }),
                withSpring(0, { damping: 40, stiffness: 1200 }),
              );
            }}
          />

          {isTop && !bioExpanded && (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setReportMenuVisible(true)}
                className="absolute top-12 right-4 z-50 bg-black/20 p-2.5 rounded-full"
              >
                <FontAwesome5 name="shield-alt" size={22} color="white" />
              </TouchableOpacity>
              <View
                style={{
                  position: "absolute",
                  top: 60,
                  left: 30,
                  zIndex: 40,
                  opacity: status === "like" ? 1 : 0,
                }}
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
              </View>
              <View
                style={{
                  position: "absolute",
                  top: 55,
                  right: 30,
                  zIndex: 40,
                  opacity: status === "dislike" ? 1 : 0,
                }}
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
              </View>
            </>
          )}

          {!bioExpanded && (
            <View className="absolute top-4 w-full flex-row justify-center gap-3 px-4">
              {photos.map((_, i) => (
                <View
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i === currentIndex ? "bg-white" : "bg-gray-500/80"}`}
                />
              ))}
            </View>
          )}

          {!bioExpanded && (
            <View
              className="absolute inset-0 justify-end"
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
                    {item.bio.replaceAll("\\n", "\n")}
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
                <ScrollView
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 80 }}
                >
                  <Text className="text-white text-xl leading-8 font-regular">
                    {item.bio.replaceAll("\\n", "\n")}
                  </Text>
                  <View className="h-20" />
                </ScrollView>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </>
  );
}
