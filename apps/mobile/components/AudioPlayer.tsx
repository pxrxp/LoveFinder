import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import dayjs from "dayjs";

type AudioPlayerProps = {
  uri: string;
  color?: "white" | "black";
};

export default function AudioPlayer({ uri, color = "white" }: AudioPlayerProps) {
  const player = useAudioPlayer(uri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);

  const togglePlayback = () => {
    if (status.currentTime >= status.duration && status.duration > 0) {
      player.seekTo(0);
      player.play();
    } else if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (seconds: number) => {
    return dayjs.duration(seconds * 1000).format("m:ss");
  };

  const textColorClass = color === "black" ? "text-black" : "text-white";
  const borderColor = color === "black" ? "border-black" : "border-white";

  return (
    <View className="flex-row items-center min-w-[140px]">
      <TouchableOpacity
        onPress={togglePlayback}
        className={`p-2 rounded-full mr-3 items-center justify-center w-9 h-9 border-2 ${borderColor}`}
      >
        <FontAwesome5
          name={status.playing ? "pause" : "play"}
          size={12}
          color={color}
          style={{ marginLeft: status.playing ? 0 : 2 }}
        />
      </TouchableOpacity>

      <View>
        <Text className={`font-bold text-regular ${textColorClass}`}>
          Audio Message
        </Text>
        <Text className={`${textColorClass} text-xs font-regular tabular-nums`}>
          {formatTime(status.currentTime)} / {formatTime(status.duration)}
        </Text>
      </View>
    </View>
  );
}
