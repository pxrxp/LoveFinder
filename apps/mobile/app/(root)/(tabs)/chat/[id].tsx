import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState, useEffect, useRef } from "react";

import { useFetch } from "@/hooks/useFetch";
import DataLoader from "@/components/DataLoader";
import MessageItem from "@/components/MessageItem";
import { Message, User } from "@/types/chat";
import ProfilePicture from "@/components/ProfilePicture";
import { useTheme } from "@/contexts/ThemeContext";
import { colors } from "@/constants/colors";
import { initSocket } from "@/services/socket";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function OtherUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const tabBarHeight = useBottomTabBarHeight();

  const chat = useFetch<Message[]>(`chat/${id}`);
  const otherUserFetch = useFetch<User>(`users/${id}`);

  const [messageToSend, setMessageToSend] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<any>(null);

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
      setConnected(true);
    });

    s.on("new_message", (msg: Message) => {
      setMessages((prev) =>
        prev.find((m) => m.message_id === msg.message_id)
          ? prev
          : [msg, ...prev],
      );
    });

    s.on("delete_message", ({ message_id }: { message_id: string }) => {
      setMessages((prev) => prev.filter((m) => m.message_id !== message_id));
    });

    s.on("disconnect", () => setConnected(false));

    return () => {
      s.emit("leave_room", { other_user_id: id });
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
            <DataLoader fetchResult={otherUserFetch} displayErrorScreen={false} displayLoadingScreen={false}>
              {(otherUser) => (
                <View className="flex-row items-center">
                  <ProfilePicture
                    url={otherUser.profile_picture_url}
                    size={40}
                    color={themeColors.textPrimary}
                  />
                  <Text className="text-xl font-bold pt-2 pl-5 text-textPrimaryLight dark:text-textPrimaryDark">
                    {otherUser.full_name}
                  </Text>
                </View>
              )}
            </DataLoader>
          ),
          animation: "slide_from_right",
          presentation: "transparentModal",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <DataLoader fetchResult={otherUserFetch}>
        {(otherUser) => {
          const messagable: boolean =
            otherUser.allow_messages_from_strangers ||
            otherUser.swipe_category === "them" ||
            otherUser.swipe_category === "both";
          return (
            <>
              <ImageBackground
                source={backgroundImage}
                resizeMode="cover"
                className="flex-1"
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
                  <DataLoader fetchResult={chat} pullToRefresh>
                    {(_, refreshing, onRefresh) => (
                      <>
                        {!connected && <Text className="text-textPrimaryLight dark:text-textPrimaryDark text-center font-bold text-lg p-9">Connecting...</Text>}
                        <FlatList
                          data={messages || []}
                          keyExtractor={(item) => item.message_id}
                          inverted
                          refreshing={refreshing ?? false}
                          onRefresh={onRefresh}
                          className="px-4"
                          renderItem={({ item }) => (
                            <MessageItem
                              other_user={otherUser || null}
                              item={item}
                              theme={theme}
                            />
                          )}
                        />
                      </>
                    )}
                  </DataLoader>

                  <View className="flex-row w-11/12 rounded-3xl self-center bg-chatBgDark border-gray-500 border-2 mt-3 overflow-hidden">
                    <TextInput
                      className="flex-1 px-3 text-white"
                      placeholderTextColor="white"
                      placeholder={
                        messagable
                          ? "Type a message"
                          : "You can't message this user"
                      }
                      editable={messagable}
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
        }}
      </DataLoader>
    </>
  );
}
