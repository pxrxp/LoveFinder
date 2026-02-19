import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import dayjs from "dayjs";

type Props = {
  uri: string;
  color?: "white" | "black";
};

export default function AudioPlayer({ uri, color = "white" }: Props) {
  const player = useAudioPlayer(uri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);

  const isWhite = color === "white";

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

  return (
    <View className="flex-row items-center min-w-[140px]">
      <TouchableOpacity
        onPress={togglePlayback}
        className={`p-2 rounded-full mr-3 items-center justify-center w-9 h-9 border-2 border-white`}
      >
        <FontAwesome5
          name={status.playing ? "pause" : "play"}
          size={12}
          color="white"
          style={{ marginLeft: status.playing ? 0 : 2 }}
        />
      </TouchableOpacity>

      <View>
        <Text
          className="font-bold text-regular text-white"
        >
          Audio Message
        </Text>
        <Text
          className="text-white text-xs font-regular tabular-nums"
        >
          {formatTime(status.currentTime)} / {formatTime(status.duration)}
        </Text>
      </View>
    </View>
  );
}
