import React from "react";
import ModalMenu from "@/components/ModalMenu";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  visible: boolean;
  onDismiss: () => void;

  launchCamera?: () => void;
  pickPhoto?: () => void;
  openAudioRecorder?: () => void;

  showCamera?: boolean;
  showPhoto?: boolean;
  showAudio?: boolean;
};

export default function MediaMenuModal({
  visible,
  onDismiss,
  launchCamera,
  pickPhoto,
  openAudioRecorder,
  showCamera = true,
  showPhoto = true,
  showAudio = true,
}: Props) {
  const { themeColors } = useTheme();

  const actions = [];

  if (showCamera && launchCamera) {
    actions.push({
      label: "Open camera",
      icon: (
        <Entypo
          name="camera"
          size={20}
          color={themeColors.textPrimary}
        />
      ),
      onPress: launchCamera,
    });
  }

  if (showPhoto && pickPhoto) {
    actions.push({
      label: "Choose from library",
      icon: (
        <FontAwesome6
          name="photo-film"
          size={17}
          color={themeColors.textPrimary}
        />
      ),
      onPress: pickPhoto,
    });
  }

  if (showAudio && openAudioRecorder) {
    actions.push({
      label: "Record audio",
      icon: (
        <MaterialIcons
          name="keyboard-voice"
          size={20}
          color={themeColors.textPrimary}
        />
      ),
      onPress: openAudioRecorder,
    });
  }

  return (
    <ModalMenu
      visible={visible}
      onDismiss={onDismiss}
      actions={actions}
    />
  );
}
