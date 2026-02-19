import { View, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "@/constants/colors";

type Props = {
  messageToSend: string;
  setMessageToSend: (val: string) => void;
  handleSend: () => void;
  sendButtonDisabled?: boolean;
  messagable?: boolean;
  openMediaMenu: () => void;
  mediaPreview?: { uri: string; type: "image" | "audio" | "video" } | null;
};

export default function ChatInputBar({
  messageToSend,
  setMessageToSend,
  handleSend,
  sendButtonDisabled,
  messagable = true,
  openMediaMenu,
  mediaPreview,
}: Props) {

  return (
    <View className="flex-row w-11/12 self-center mt-3 overflow-hidden rounded-3xl border-2 bg-chatBgDark/60 border-gray-500">
      <TouchableOpacity
        onPress={openMediaMenu}
        className="p-2 rounded-r-full mr-2 justify-center items-center"
        style={{
          backgroundColor: mediaPreview ? colors.light.accent : "transparent",
        }}
      >
        <Ionicons
          name={mediaPreview ? "attach" : "add-circle-outline"}
          size={26}
          color="white"
        />
      </TouchableOpacity>

      <TextInput
        className="flex-1 text-white pr-4"
        placeholder={
          mediaPreview
            ? sendButtonDisabled
              ? `Uploading ${mediaPreview.type} ...`
              : `Ready to send ${mediaPreview.type} ...`
            : messagable
              ? "Type a message"
              : "You can't message this user"
        }
        placeholderTextColor="white"
        editable={messagable && !mediaPreview}
        value={messageToSend}
        onChangeText={setMessageToSend}
        multiline
      />

      {(messageToSend.trim() || mediaPreview) && !sendButtonDisabled && (
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
