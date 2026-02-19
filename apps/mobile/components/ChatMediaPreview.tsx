import { View, TouchableOpacity, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import VideoThumbnailPreview from "@/components/VideoThumbnailPreview";
import AudioPlayer from "@/components/AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

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
};

export default function ChatMediaPreview({
  mediaPreview,
  onClear,
  onViewImage,
  onPlayVideo,
  onRecordAudio,
}: Props) {
  const {themeColors} = useTheme();
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
        <View className="px-4 py-3 flex-row self-center items-center bg-black/50 rounded-full">
          <AudioPlayer uri={mediaPreview.uri} />
          <TouchableOpacity
            onPress={onRecordAudio}
            className="ml-6 p-1 rounded-full border border-white"
          >
            <Ionicons name="refresh" size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {mediaPreview.type === "video" && (
        <VideoThumbnailPreview
          uri={mediaPreview.uri}
          onPress={onPlayVideo}
          width={96}
          height={96}
          style={{ borderRadius: 8 }}
        />
      )}

      <TouchableOpacity
        onPress={onClear}
        className="absolute -top-1 -left-1 bg-black/65 p-1 rounded-full m-2"
      >
        <MaterialIcons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}
