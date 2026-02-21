import React from "react";
import ModalMenu from "@/components/ModalMenu";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onDelete: () => void;
};

export default function DeleteMenuModal({
  visible,
  onDismiss,
  onDelete,
}: Props) {
  return (
    <ModalMenu
      visible={visible}
      onDismiss={onDismiss}
      actions={[
        {
          label: "Delete",
          color: "red",
          icon: (
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color="red"
            />
          ),
          onPress: onDelete,
        },
      ]}
    />
  );
}
