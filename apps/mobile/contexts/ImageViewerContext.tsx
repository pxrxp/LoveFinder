import React, { createContext, useContext, useState, ReactNode } from "react";
import { Modal, View, TouchableOpacity, Dimensions } from "react-native";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Image } from "expo-image";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ImageViewerContextType = {
  openImageViewer: (uri: string) => void;
};

const ImageViewerContext = createContext<ImageViewerContextType | undefined>(
  undefined,
);

export const ImageViewerProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const closeViewer = () => {
    "worklet";
    backdropOpacity.value = withTiming(0);
    translateY.value = withTiming(0, { duration: 200 }, () => {
      scheduleOnRN(setVisible, false);
      scheduleOnRN(setImageUri, null);
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (
        Math.abs(event.translationY) > 150 ||
        Math.abs(event.velocityY) > 1000
      ) {
        translateY.value = withTiming(
          event.translationY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
          { duration: 200 },
          () => {
            scheduleOnRN(setVisible, false);
            scheduleOnRN(setImageUri, null);
          },
        );
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateY.value),
      [0, SCREEN_HEIGHT / 2],
      [1, 0],
      "clamp",
    ),
  }));

  const onOpen = (uri: string) => {
    setImageUri(uri);
    translateY.value = 0;
    backdropOpacity.value = 1;
    setVisible(true);
  };

  return (
    <ImageViewerContext.Provider value={{ openImageViewer: onOpen }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => scheduleOnRN(closeViewer)}
      >
        <GestureHandlerRootView className="flex-1">
          <Animated.View
            className="flex-1 bg-black"
            style={animatedBackdropStyle}
          >
            <GestureDetector gesture={panGesture}>
              <Animated.View className="flex-1" style={animatedImageStyle}>
                {imageUri && (
                  <View className="flex-1 justify-center items-center">
                    <Zoomable
                      minScale={1}
                      maxScale={5}
                      isSingleTapEnabled
                      onSingleTap={() => scheduleOnRN(setVisible, false)}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="contain"
                        transition={200}
                      />
                    </Zoomable>
                  </View>
                )}
              </Animated.View>
            </GestureDetector>

            <TouchableOpacity
              onPress={() => scheduleOnRN(closeViewer)}
              activeOpacity={0.7}
              className="absolute bg-black/50 p-2 rounded-full border border-white/20"
              style={{
                top: insets.top + 10,
                right: 20,
                zIndex: 999,
              }}
            >
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    </ImageViewerContext.Provider>
  );
};

export const useImageViewerContext = () => {
  const context = useContext(ImageViewerContext);
  if (!context) throw new Error("useImageViewer must be used within Provider");
  return context;
};
