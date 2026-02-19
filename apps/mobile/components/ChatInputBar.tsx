import { View, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  messageToSend: string;
  setMessageToSend: (val: string) => void;
  handleSend: () => void;
  messagable?: boolean;
  openMediaMenu: () => void;
  mediaPreview?: { uri: string; type: "image" | "audio" | "video" } | null;
};

export default function ChatInputBar({
  messageToSend,
  setMessageToSend,
  handleSend,
  messagable = true,
  openMediaMenu,
  mediaPreview,
}: Props) {
  const { themeColors } = useTheme();

  return (
    <View className="flex-row w-11/12 self-center mt-3 overflow-hidden rounded-3xl border-2 border-gray-500 bg-chatBgDark">
      <TouchableOpacity onPress={openMediaMenu} className="p-2">
        <Ionicons
          name="add-circle-outline"
          size={26}
          color={themeColors.textPrimary}
        />
      </TouchableOpacity>

      <TextInput
        className="flex-1 text-white pr-4"
        placeholder={messagable ? "Type a message" : "You can't message this user"}
        placeholderTextColor="white"
        editable={messagable}
        value={messageToSend}
        onChangeText={setMessageToSend}
        multiline
      />

      {(messageToSend.trim() || mediaPreview) && (
        <TouchableOpacity
          onPress={handleSend}
          className="bg-accent py-3 px-4 rounded-l-full"
        >
          <MaterialIcons name="send" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
