/**
 * A single chat bubble.
 *
 * It shows the message text (or image) and handles the side
 * it's on (left for "Them", right for "Me"). It also shows
 * read receipts when a message is seen.
 */
import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import VideoThumbnailPreview from "@/components/VideoThumbnailPreview";
import AudioPlayer from "@/components/AudioPlayer";
import { useImageViewerContext } from "@/contexts/ImageViewerContext";
import { User } from "@/types/User";
import { Message } from "@/types/Message";

interface MessageItemProps {
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
}: MessageItemProps) {
  const isMine = item.sender_id !== other_user?.user_id;
  const [failed, setFailed] = useState(false);
  const { theme, themeColors } = useTheme();

  const { openImageViewer } = useImageViewerContext();
  const { openVideoPlayer } = useVideoPlayerContext();

  useEffect(() => setFailed(false), [item.message_id]);

  const renderText = () => (
    <View
      style={{ minWidth: 60 }}
      className={`max-w-[260px] rounded-2xl ${
        isMine
          ? "bg-accent shadow-sm"
          : "bg-bgPrimaryDark dark:bg-bgPrimaryLight"
      }`}
    >
      <View className="px-2">
        <Text
          className={`font-regular text-[15px] leading-6 ${item.is_read ? "mr-7" : "mr-2"} ml-1 my-2 ${
            isMine
              ? "text-white"
              : "text-textPrimaryDark dark:text-textPrimaryLight"
          }`}
        >
          {item.message_content}
        </Text>
        {item.is_read && (
          <View className="flex-row justify-end -mt-5 -mr-1 p-1">
            <Ionicons
              name="checkmark-done-sharp"
              size={18}
              color={isMine ? "white" : themeColors.bgPrimary}
              style={{ opacity: 0.9 }}
            />
          </View>
        )}
      </View>
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
        color={isMine ? "white" : theme === "dark" ? "black" : "white"}
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
