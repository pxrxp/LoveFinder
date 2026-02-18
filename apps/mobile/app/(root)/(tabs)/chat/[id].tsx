import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState, useEffect } from "react";

import { useFetch } from "@/hooks/useFetch";
import DataLoader from "@/components/DataLoader";
import MessageItem from "@/components/MessageItem";
import { Message, User } from "@/types/chat";
import ProfilePicture from "@/components/ProfilePicture";
import { useTheme } from "@/contexts/ThemeContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ModalMenu from "@/components/ModalMenu";
import { formatFriendlyDate } from "@/services/date";
import { showThemedError } from "@/services/themed-error";
import { useSocket } from "@/contexts/SocketContext";

export default function OtherUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, themeColors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const chat = useFetch<Message[]>(`chat/${id}`);
  const otherUserFetch = useFetch<User>(`users/${id}`);

  const [messageToSend, setMessageToSend] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pressedMessage, setPressedMessage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const socket = useSocket();

  const handleSend = () => {
    const text = messageToSend.trim();
    if (!text || !socket) return;
    socket.emit("send_message", { other_user_id: id, message: text, message_type: "text" });
    setMessageToSend("");
  };

  const handleDelete = (message_id: string) => {
    socket.emit("delete_message", { other_user_id: id, message_id });
  };

  const backgroundImage =
    theme === "light"
      ? require("@/assets/images/chat-theme-light.jpg")
      : require("@/assets/images/chat-theme-dark.jpg");

  useEffect(() => {
    if (chat.data) setMessages(chat.data);
  }, [chat.data]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) =>
      setMessages(prev => (prev.find(m => m.message_id === msg.message_id) ? prev : [msg, ...prev]));

    const handleDeleteMessage = ({ message_id }: { message_id: string }) =>
      setMessages(prev => prev.filter(m => m.message_id !== message_id));

    const handleWsError = (data: { action: string; error: string }) => {
      showThemedError(`${data.action}\n${data.error}`, themeColors);
    };

    const handleConnect = () => {
      socket.emit("join_room", { other_user_id: id });
    };

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);
    socket.on("delete_message", handleDeleteMessage);
    socket.on("ws_error", handleWsError);

    return () => {
      socket.emit("leave_room", { other_user_id: id });
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.off("delete_message", handleDeleteMessage);
      socket.off("ws_error", handleWsError);
    };
  }, [socket, id, themeColors]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTitle: () => (
            <DataLoader fetchResult={otherUserFetch} displayErrorScreen={false} displayLoadingScreen={false}>
              {(otherUser) => (
                <View className="flex-row items-center">
                  <ProfilePicture url={otherUser.profile_picture_url} size={40} color={themeColors.textPrimary} />
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
          const messagable =
            otherUser.allow_messages_from_strangers ||
            otherUser.swipe_category === "them" ||
            otherUser.swipe_category === "both";

          return (
            <ImageBackground
              source={backgroundImage}
              resizeMode="cover"
              className="flex-1"
              style={{ paddingBottom: tabBarHeight + 15, backgroundColor: themeColors.chatBg }}
            >
              <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={100}>
                <DataLoader fetchResult={chat} pullToRefresh>
                  {(_, refreshing, onRefresh) => (
                    <>
                      {!socket?.connected && (
                        <Text className="text-textPrimaryLight dark:text-textPrimaryDark text-center font-bold text-lg p-9">
                          Connecting...
                        </Text>
                      )}

                      {pressedMessage && (
                        <Pressable
                          style={{ ...StyleSheet.absoluteFillObject, zIndex: 1 }}
                          onPress={() => setPressedMessage(null)}
                        />
                      )}

                      <FlatList
                        data={messages || []}
                        keyExtractor={(item) => item.message_id}
                        inverted
                        refreshing={refreshing ?? false}
                        onRefresh={onRefresh}
                        className="px-4"
                        ListFooterComponent={<View className="w-full h-12" />}
                        renderItem={({ item }) => (
                          <>
                            <ModalMenu
                              visible={menuVisible}
                              onDismiss={() => setMenuVisible(false)}
                              actions={[
                                {
                                  label: "Delete",
                                  color: "red",
                                  icon: <MaterialCommunityIcons name="delete-outline" size={24} color="red" />,
                                  onPress: () => handleDelete(item.message_id),
                                },
                              ]}
                            />

                            {pressedMessage === item.message_id && (
                              <Text
                                className={`text-sm font-light text-gray-200 pb-5 ${
                                  item.sender_id === otherUser.user_id ? "text-left pl-3" : "text-right pr-3"
                                }`}
                              >
                                {formatFriendlyDate(item.sent_at)}
                              </Text>
                            )}

                            <MessageItem
                              other_user={otherUser || null}
                              item={item}
                              onPress={(e) => {
                                e.stopPropagation();
                                setPressedMessage(prev => (prev === item.message_id ? null : item.message_id));
                              }}
                              onLongPress={() => item.sender_id !== otherUser.user_id && setMenuVisible(true)}
                            />
                          </>
                        )}
                      />
                    </>
                  )}
                </DataLoader>

                <View className="flex-row w-11/12 rounded-3xl self-center bg-chatBgDark border-gray-500 border-2 mt-3 overflow-hidden">
                  <TextInput
                    className="flex-1 px-3 text-white"
                    placeholderTextColor="white"
                    placeholder={messagable ? "Type a message" : "You can't message this user"}
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
          );
        }}
      </DataLoader>
    </>
  );
}
