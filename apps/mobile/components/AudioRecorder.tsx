import { useTheme } from "@/contexts/ThemeContext";
import { showThemedError } from "@/services/themed-error";
import { Text, View } from "react-native";
import {
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";

import { useEffect } from "react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export default function AudioRecorder() {
  const { themeColors } = useTheme();

  const audioRecorder = useAudioRecorder({...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true});
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
  };

  useEffect(() => {
    (async () => {
      if (!(await getRecordingPermissionsAsync()).granted) {
        if (!(await requestRecordingPermissionsAsync()).granted) {
          showThemedError("Microphone permission denied", themeColors);
        }
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
      record();
    })();
  }, []);

    return (
    <View className="flex-1 mb-5">
      <Text className="text-white">{dayjs.duration(recorderState.durationMillis).format("HH:mm:ss")}</Text>
      <Text className="text-white">Metering: {recorderState.metering}</Text>
    </View>
  );
}
