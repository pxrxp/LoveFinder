import {
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  Text,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { VideoThumbnailsResult } from "expo-video-thumbnails";

export type MediaPreviewType = {
  uri: string;
  type: "image" | "video" | "audio";
};

type Props = {
  mediaPreview: MediaPreviewType;
  onClear: () => void;
  onViewImage: (uri: string) => void;
  onPlayVideo: () => void;
  onRecordAudio: () => void;
  videoThumbnail: VideoThumbnailsResult | null;
};

export default function ChatMediaPreview({
  mediaPreview,
  onClear,
  onViewImage,
  onPlayVideo,
  onRecordAudio,
  videoThumbnail
}: Props) {
  if (!mediaPreview) return null;

  return (
    <View className="mx-5 my-2 relative">
      {mediaPreview.type === "image" && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onViewImage(mediaPreview.uri)}
        >
          <Image
            source={{ uri: mediaPreview.uri }}
            style={{ width: 96, height: 96, borderRadius: 8 }}
          />
        </TouchableOpacity>
      )}

      {mediaPreview.type === "audio" && (
        <TouchableOpacity
          onPress={onRecordAudio}
          className="p-2 bg-gray-700 rounded-md self-start"
        >
          <Text className="text-white">Redo / Play Audio</Text>
        </TouchableOpacity>
      )}

      {mediaPreview.type === "video" && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPlayVideo}
        >
          <ImageBackground
            source={{ uri: videoThumbnail?.uri || "" }}
            style={{
              width: 96,
              height: 96,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <FontAwesome5
              name="play-circle"
              size={42}
              color="black"
              className="opacity-70"
            />
          </ImageBackground>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onClear}
        className="absolute -top-1 -left-1 bg-black/40 p-1 rounded-full m-2"
      >
        <MaterialIcons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}
