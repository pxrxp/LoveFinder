import React, { useEffect, useState } from "react";
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
  loading,
  setLoading,
  videoThumbnail,
}: {
  player: VideoPlayer;
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  videoThumbnail: VideoThumbnailsResult;
}) {
  const [internalVisible, setInternalVisible] = useState(visible);

  useEffect(() => {
    if (visible) setInternalVisible(true);
  }, [visible]);

  useEffect(() => {
    if (!internalVisible || !player) return;

    const lock = async () => {
      if (videoThumbnail?.width > videoThumbnail?.height) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT,
        );
      }
      StatusBar.setHidden(true, "fade");
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBackgroundColorAsync("black");
    };

    lock();
  }, [internalVisible, player]);

  const handleClose = async () => {
    StatusBar.setHidden(false, "fade");
    NavigationBar.setVisibilityAsync("visible");
    NavigationBar.setBackgroundColorAsync("black");
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.DEFAULT,
    );

    setTimeout(() => setInternalVisible(false), 100);
    onClose();
    setLoading(false);
  };

  if (!internalVisible) return null;

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
          onFirstFrameRender={() => setLoading(false)}
        />
        <TouchableOpacity
          onPress={handleClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 8,
            borderRadius: 999,
          }}
        >
          <MaterialIcons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </Portal>
  );
}
