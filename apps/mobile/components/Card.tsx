import { View, Text, ImageBackground, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { FeedUser } from "@/types/FeedUser";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";

interface CardProps {
  style: any;
  showHeartStyle: any;
  showCrossStyle: any;
  item: FeedUser;
  isTop: boolean;
}

export default function Card({
  style,
  showHeartStyle,
  showCrossStyle,
  item,
  isTop,
}: CardProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <Animated.View
      style={[
        { position: "absolute", inset: 0 },
        isTop ? style : { zIndex: -1 },
      ]}
    >
      <ImageBackground
        source={{ uri: item.image_url }}
        style={{ backgroundColor: themeColors.chatBg }}
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
                maskElement={
                  <AntDesign name="heart" size={100} color="white" />
                }
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
          <Text className="text-white text-3xl font-bold">
            {item.full_name}{" "}
          </Text>
          <Text className="text-white text-3xl font-regular"> {item.age}</Text>
        </View>
        <Text className="text-white text-base font-regular">{item.bio}</Text>
      </ImageBackground>
    </Animated.View>
  );
}
