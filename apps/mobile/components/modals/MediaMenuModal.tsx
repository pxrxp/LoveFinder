import React from "react";
import ModalMenu from "@/components/ModalMenu";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  launchCamera: () => void;
  pickPhoto: () => void;
  openAudioRecorder: () => void;
};

export default function MediaMenuModal({ visible, onDismiss, launchCamera, pickPhoto, openAudioRecorder }: Props) {
  const { themeColors } = useTheme();

  return (
    <ModalMenu
      visible={visible}
      onDismiss={onDismiss}
      actions={[
        {
          label: "Take photo",
          icon: <Entypo name="camera" size={20} color={themeColors.textPrimary} />,
          onPress: launchCamera,
        },
        {
          label: "Choose a photo/video",
          icon: <FontAwesome6 name="photo-film" size={17} color={themeColors.textPrimary} />,
          onPress: pickPhoto,
        },
        {
          label: "Record audio",
          icon: <FontAwesome5 name="microphone" size={22} color={themeColors.textPrimary} />,
          onPress: openAudioRecorder,
        },
      ]}
    />
  );
}
