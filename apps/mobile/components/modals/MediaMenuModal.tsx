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

  hideCameraAction?: boolean;
  hideLibraryPickerAction?: boolean;
  hideAudioRecorderAction?: boolean;
};

export default function MediaMenuModal({
  visible,
  onDismiss,
  launchCamera,
  pickPhoto,
  openAudioRecorder,
  hideCameraAction = false,
  hideLibraryPickerAction = false,
  hideAudioRecorderAction = false,
}: Props) {
  const { themeColors } = useTheme();

  const actions = [];

  if (!hideCameraAction && launchCamera) {
    actions.push({
      label: "Open camera",
      icon: <Entypo name="camera" size={20} color={themeColors.textPrimary} />,
      onPress: launchCamera,
    });
  }

  if (!hideLibraryPickerAction && pickPhoto) {
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

  if (!hideAudioRecorderAction && openAudioRecorder) {
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
    <ModalMenu visible={visible} onDismiss={onDismiss} actions={actions} />
  );
}
