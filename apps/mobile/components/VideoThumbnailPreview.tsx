import {
  GestureResponderEvent,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { ImageBackground } from "expo-image";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useVideoThumbnail } from "@/hooks/useVideoThumbnail";

type Props = {
  uri: string;
  onPress: () => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  style?: ViewStyle;
  width?: number;
  height?: number;
};

export default function VideoThumbnailPreview({
  uri,
  onPress,
  onLongPress,
  style,
  width = 256,
  height = 256,
}: Props) {
  const { thumbnail } = useVideoThumbnail(uri);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      style={style}
    >
      <ImageBackground
        source={{ uri: thumbnail?.uri }}
        style={{
          width,
          height,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: 12,
          overflow: "hidden",
        }}
        contentFit="cover"
      >
        <FontAwesome5
          name="play-circle"
          size={Math.min(width, height) * 0.25}
          color="white"
          style={{ opacity: 0.8, shadowOpacity: 0.5, shadowRadius: 5 }}
        />
      </ImageBackground>
    </TouchableOpacity>
  );
}
