import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useEffect, useState } from "react";
import { Message, User } from "@/types/chat";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import VideoThumbnailPreview from "./VideoThumbnailPreview";
import AudioPlayer from "./AudioPlayer";
import { useImageViewerContext } from "@/contexts/ImageViewerContext";

interface Props {
  other_user: User | null;
  item: Message;
  onPress: (event: GestureResponderEvent) => void;
  onLongPress: (event: GestureResponderEvent) => void;
}

export default function MessageItem({
  other_user,
  item,
  onPress,
  onLongPress,
}: Props) {
  const isMine = item.sender_id !== other_user?.user_id;
  const [failed, setFailed] = useState(false);
  const { theme } = useTheme();

  const { openImageViewer } = useImageViewerContext();
  const { openVideoPlayer } = useVideoPlayerContext();

  useEffect(() => setFailed(false), [item.message_id]);

  const renderText = () => (
    <View
      className={`max-w-52 px-2 items-end flex-row-reverse rounded-2xl ${
        isMine
          ? "bg-accent shadow-md"
          : "bg-bgPrimaryDark dark:bg-bgPrimaryLight"
      }`}
    >
      {item.is_read && (
        <Ionicons
          name="checkmark-done-sharp"
          size={18}
          color={
            isMine
              ? "white"
              : theme === "dark"
                ? colors.light.textPrimary
                : colors.dark.textPrimary
          }
        />
      )}
      <Text
        className={`px-2 py-2 text-base ${
          isMine
            ? "text-white"
            : "text-textPrimaryDark dark:text-textPrimaryLight"
        }`}
      >
        {item.message_content}
      </Text>
    </View>
  );

  const renderImage = () => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => !failed && openImageViewer(item.message_content)}
      onLongPress={onLongPress}
    >
      <Image
        source={{ uri: item.message_content }}
        style={{
          borderRadius: 12,
          width: failed ? 56 : 256,
          height: failed ? 56 : 256,
        }}
        className={`${failed ? "w-14 h-14" : "w-64 h-64"} rounded-xl`}
        onError={() => setFailed(true)}
      />
      {failed && (
        <MaterialIcons
          name="image-not-supported"
          size={50}
          color="gray"
          style={{ position: "absolute" }}
        />
      )}
    </TouchableOpacity>
  );

  const renderAudio = () => (
    <View
      className={`p-3 rounded-2xl w-52 ${
        isMine ? "bg-accent" : "bg-bgPrimaryDark dark:bg-bgPrimaryLight"
      }`}
    >
      <AudioPlayer
        uri={item.message_content}
        color={isMine ? "white" : theme === "dark" ? "white" : "black"}
      />
    </View>
  );

  const renderVideo = () => (
    <VideoThumbnailPreview
      uri={item.message_content}
      onPress={() => openVideoPlayer(item.message_content)}
      onLongPress={onLongPress}
      width={256}
      height={256}
    />
  );

  return (
    <View className={`my-2 px-1 ${isMine ? "self-end" : "self-start"}`}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.9}
      >
        {item.message_type === "text" && renderText()}
        {item.message_type === "image" && renderImage()}
        {item.message_type === "audio" && renderAudio()}
        {item.message_type === "video" && renderVideo()}
      </TouchableOpacity>
    </View>
  );
}
