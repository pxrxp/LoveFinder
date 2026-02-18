import React, { useEffect } from "react";
import { View, TouchableOpacity, StatusBar } from "react-native";
import { Portal } from "@gorhom/portal";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { VideoPlayer, VideoView } from "expo-video";
import { VideoThumbnailsResult } from "expo-video-thumbnails";

export default function FullScreenVideo({
  player,
  visible,
  onClose,
  videoThumbnail,
}: {
  player: VideoPlayer;
  visible: boolean;
  onClose: () => void;
  videoThumbnail: VideoThumbnailsResult | null;
}) {
  useEffect(() => {
    if (!visible || !player) return;

    const lockOrientation = async () => {
      if (videoThumbnail && videoThumbnail?.width > videoThumbnail?.height) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT,
        );
      }
    };

    lockOrientation();
    StatusBar.setHidden(true, "fade");
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

    return () => {
      StatusBar.setHidden(false, "fade");
      NavigationBar.setVisibilityAsync("visible");
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, [visible, player]);

  if (!visible) return null;

  return (
    <Portal>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        }}
      >
        <VideoView
          style={{ width: "100%", height: "100%" }}
          player={player}
          allowsFullscreen={false}
        />

        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 8,
            borderRadius: 999,
            opacity: 0.5
          }}
        >
          <MaterialIcons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </Portal>
  );
}
