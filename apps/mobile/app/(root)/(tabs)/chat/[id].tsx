import {
  View,
  Text,
  FlatList,
  Image,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFetch } from "@/hooks/useFetch";
import ProfilePicture from "@/components/ProfilePicture";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { initSocket } from "@/services/socket";

interface Message {
  is_read: boolean;
  message_content: string;
  message_id: string;
  message_type: "text" | "image";
  sender_id: string;
  sent_at: string;
}

interface User {
  user_id: string;
  full_name: string;
  age: number;
  sexual_orientation: string;
  bio: string;
  profile_picture_url: string | null;
}

function MessageItem({
  other_user,
  item,
  theme,
}: {
  other_user: User | null;
  item: Message;
  theme: "light" | "dark";
}) {
  const isMine = item.sender_id !== other_user?.user_id;

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [item.message_id]);

  return (
    <View className={`my-2 px-1 ${isMine ? "self-end" : "self-start"}`}>
      {item.message_type === "text" ? (
        <Text
          className={`px-4 py-2 rounded-2xl text-base ${
            isMine
              ? "bg-accent text-white shadow-md"
              : "bg-bgPrimaryDark dark:bg-bgPrimaryLight text-textPrimaryDark dark:text-textPrimaryLight"
          }`}
        >
          {item.message_content}
        </Text>
      ) : item.message_type === "image" ? (
        <View>
          <Image
            source={{ uri: item.message_content }}
            className={`${failed ? "w-14 h-14" : "w-64 h-64"} rounded-xl`}
            onError={() => setFailed(true)}
          />

          {failed && (
            <MaterialIcons
              name="image-not-supported"
              size={50}
              color="gray"
              style={{ position: "absolute" }}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function OtherUserScreen() {
  const { id } = useLocalSearchParams();
  const chat = useFetch<Message[]>(`chat/${id}`);
  const other_user = useFetch<User>(`users/${id}`);
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const tabBarHeight = useBottomTabBarHeight();

  const [messageToSend, setMessageToSend] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  const [pressedMessage, setPressedMessage] = useState<string | null>(null);

  const handleSend = () => {
    const text = messageToSend.trim();

    if (!text || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      other_user_id: id,
      message: text,
      message_type: "text",
    });

    setMessageToSend("");
  };

  const backgroundImage =
    theme === "light"
      ? require("@/assets/images/chat-theme-light.jpg")
      : require("@/assets/images/chat-theme-dark.jpg");

  useEffect(() => {
    if (chat.data) setMessages(chat.data);
  }, [chat.data]);

  useEffect(() => {
    const s = initSocket();
    socketRef.current = s;

    s.connect();

    s.on("connect", () => {
      console.log("Connected socket:", s.id);
      s.emit("join_room", { other_user_id: id });
    });

    s.on("new_message", (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.message_id === msg.message_id)) {
          return prev;
        }
        return [msg, ...prev];
      });
    });

    s.on("delete_message", ({ message_id }) => {
      setMessages((prev) => prev.filter((m) => m.message_id !== message_id));
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    return () => {
      s.emit("leave_room", {
        other_user_id: id,
      });

      s.off("new_message");
      s.off("delete_message");

      s.disconnect();
    };
  }, [id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTitle: () => (
            <View className="flex-row items-center">
              {other_user.data && (
                <>
                  <ProfilePicture
                    url={other_user.data.profile_picture_url}
                    size={40}
                    color={themeColors.textPrimary}
                  />
                  <Text className="text-xl font-bold pt-2 pl-5 text-textPrimaryLight dark:text-textPrimaryDark">
                    {other_user.data.full_name}
                  </Text>
                </>
              )}
            </View>
          ),
        }}
      />

      <ImageBackground
        source={backgroundImage}
        resizeMode="cover"
        className={`flex-1`}
        style={{
          paddingBottom: tabBarHeight + 15,
          backgroundColor: themeColors.chatBg,
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={100}
        >
          <FlatList
            data={messages || []}
            keyExtractor={(item) => item.message_id}
            inverted
            refreshing={chat.loading}
            className="px-4"
            renderItem={({ item }) => (
              <MessageItem
                other_user={other_user.data}
                item={item}
                theme={theme}
              />
            )}
          />
          <View className="flex-row w-11/12 rounded-3xl self-center bg-chatBgDark border-gray-500 border-2 mt-3 overflow-hidden">
            <TextInput
              className="flex-1 px-3 text-white"
              placeholderTextColor={"white"}
              placeholder="Type a message"
              value={messageToSend}
              onChangeText={setMessageToSend}
              multiline
            />
            {messageToSend.trim().length > 0 && (
              <TouchableOpacity
                onPress={handleSend}
                className="rounded-l-full bg-accent pl-6 pr-7 justify-center"
              >
                <MaterialIcons name="send" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
}
