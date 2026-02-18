import { useTheme } from "@/contexts/ThemeContext";
import { showThemedError } from "@/services/themed-error";
import { Text, TouchableOpacity, View } from "react-native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";

import Fontisto from "@expo/vector-icons/Fontisto";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import AudioWaveform from "./AudioWaveform";
dayjs.extend(duration);

export default function AudioRecorder({
  onRecordComplete,
}: {
  onRecordComplete: (uri: string | null) => void;
}) {
  const { themeColors } = useTheme();

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });

  const recorderState = useAudioRecorderState(audioRecorder);

  const [levels, setLevels] = useState<number[]>([]);

  const record = async () => {
    audioRecorder.record();
  };

  const pauseRecording = () => {
    audioRecorder.pause();
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    onRecordComplete(audioRecorder.uri);
  };

  useEffect(() => {
    (async () => {
      let { granted } = await getRecordingPermissionsAsync();
      if (!granted) {
        const result = await requestRecordingPermissionsAsync();
        granted = result.granted;
      }
      if (!granted) {
        showThemedError("Microphone permission denied", themeColors);
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await audioRecorder.prepareToRecordAsync();
    })();
  }, []);

  useEffect(() => {
    if (!recorderState.isRecording) return;

    const interval = setInterval(() => {
      if (recorderState.metering != null) {
        setLevels((prev) => {
          const next = [...prev, recorderState.metering!];
          return next.slice(-100);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [recorderState.isRecording, recorderState.metering]);

  return (
    <View className="flex-row items-center justify-center">
      {!recorderState.isRecording && (
        <TouchableOpacity
          activeOpacity={recorderState.canRecord ? 0.2 : 1}
          onPress={() => recorderState.canRecord && record()}
        >
          <Fontisto
            name="record"
            size={24}
            color={recorderState.canRecord ? "red" : "gray"}
          />
        </TouchableOpacity>
      )}

      {recorderState.isRecording && (
        <View className="flex-row gap-x-6">
          <TouchableOpacity
            onPress={() => {
              pauseRecording();
            }}
          >
            <Fontisto name="pause" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              stopRecording();
            }}
          >
            <Fontisto name="stop" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-white px-6">
        {dayjs.duration(recorderState?.durationMillis).format("HH:mm:ss")}
      </Text>
      <AudioWaveform levels={levels} className="w-1/3 h-12" />
    </View>
  );
}
