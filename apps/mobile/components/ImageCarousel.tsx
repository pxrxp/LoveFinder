import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";

interface ImageCarouselProps {
  images: string[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageCarousel = ({
  images,
  currentIndex,
  onNext,
  onPrev,
}: ImageCarouselProps) => {
  if (!images || images.length === 0) return null;

  return (
    <View className="flex-1 relative overflow-hidden">
      <Image
        source={{ uri: images[currentIndex] }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />

      <TouchableOpacity
        activeOpacity={1}
        onPress={onPrev}
        className="absolute left-0 top-0 bottom-0 w-1/2 z-10"
      />
      <TouchableOpacity
        activeOpacity={1}
        onPress={onNext}
        className="absolute right-0 top-0 bottom-0 w-1/2 z-10"
      />
    </View>
  );
};
