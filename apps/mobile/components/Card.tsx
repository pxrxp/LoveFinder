import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ImageBackground } from "expo-image";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FeedUser } from "@/types/FeedUser";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";
import ReportModal from "./modals/ReportModal";
import { ReportReason, reportUser } from "@/services/user-actions";
import { showThemedError } from "@/services/themed-error";
import { showThemedSuccess } from "@/services/themed-success";

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
  const { themeColors } = useTheme();

  const [reportMenuVisible, setReportMenuVisible] = useState(false);
  const handleReportSubmit = (reason: ReportReason, details: string) => {
    try {
      reportUser(item.user_id, reason, details);
      setReportMenuVisible(false);
      showThemedSuccess("User has been reported to our team.", themeColors);
    } catch (e: any) {
      showThemedError(e, themeColors);
    }
  };

  return (
    <>
      <ReportModal
        visible={reportMenuVisible}
        onDismiss={() => setReportMenuVisible(false)}
        onSubmit={handleReportSubmit}
      />

      <Animated.View
        style={[
          { position: "absolute", inset: 0 },
          isTop ? style : { zIndex: -1 },
        ]}
      >
        <ImageBackground
          source={{ uri: item.image_url }}
          style={{
            backgroundColor: themeColors.chatBg,
            flex: 1,
            justifyContent: "flex-end",
            padding: 20,
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {isTop && (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setReportMenuVisible(true)}
                style={{
                  position: "absolute",
                  top: 15,
                  right: 10,
                  zIndex: 50,
                  backgroundColor: "rgba(0,0,0,0.2)",
                  padding: 10,
                  borderRadius: 999,
                }}
              >
                <FontAwesome5 name="shield-alt" size={22} color="white" />
              </TouchableOpacity>
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
            <Text className="text-white text-3xl font-regular">
              {" "}
              {item.age}
            </Text>
          </View>
          <Text className="text-white text-base font-regular">{item.bio}</Text>
        </ImageBackground>
      </Animated.View>
    </>
  );
}
