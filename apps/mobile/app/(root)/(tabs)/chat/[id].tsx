import {
  Text,
  KeyboardAvoidingView,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { ImageBackground } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState, useEffect, useCallback } from "react";

// Hooks & Contexts
import { useFetch } from "@/hooks/useFetch";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useMediaPreview } from "@/hooks/useMediaPreview";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessageTracker } from "@/contexts/MessageTrackerContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useImageViewerContext } from "@/contexts/ImageViewerContext";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";

// Services
import { uploadChatMedia } from "@/services/chat-media";
import { pickPhoto, launchCamera } from "@/services/media-picker";
import { showThemedError } from "@/services/themed-error";

// Components
import DataLoader from "@/components/DataLoader";
import ChatHeader from "@/components/ChatHeader";
import ChatMessagesList from "@/components/ChatMessagesList";
import ChatInputBar from "@/components/ChatInputBar";
import ChatMediaPreview from "@/components/ChatMediaPreview";
import MediaMenuModal from "@/components/modals/MediaMenuModal";
import DeleteMenuModal from "@/components/modals/DeleteMenuModal";
import AudioRecorder from "@/components/AudioRecorder";

// Types
import { Message, User } from "@/types/chat";
import { MaterialIcons } from "@expo/vector-icons";
import LoadingScreen from "@/components/LoadingScreen";
import { Portal } from "@gorhom/portal";

export default function OtherUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, themeColors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { settings } = useSettings();

  // --- Global Contexts ---
  const { openImageViewer } = useImageViewerContext();
  const { openVideoPlayer, loading: videoLoading } = useVideoPlayerContext();

  // --- Hooks ---
  const chat = useFetch<Message[]>(`chat/${id}`);
  const otherUserFetch = useFetch<User>(`users/${id}`);
  const { setActiveChatUserId, markAsRead } = useMessageTracker();

  const { mediaPreview, setMediaPreview, clearMediaPreview } =
    useMediaPreview();

  // --- Local State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [pressedMessage, setPressedMessage] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [audioRecorderVisible, setAudioRecorderVisible] = useState(false);

  // --- Socket Logic ---
  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) =>
      prev.find((m) => m.message_id === msg.message_id) ? prev : [msg, ...prev],
    );
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.message_id !== messageId));
  }, []);

  const socket = useChatSocket({
    otherUserId: id,
    onMessage: handleNewMessage,
    onDelete: handleDeleteMessage,
    onError: (msg) => showThemedError(msg, themeColors),
    sendReceipts: settings.sendReceipts,
  });
  const [sending, setSending] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (chat.data) setMessages(chat.data);
  }, [chat.data]);

  useEffect(() => {
    setActiveChatUserId(id);
    markAsRead(id);
    return () => setActiveChatUserId(null);
  }, [id]);

  // --- Actions ---
  const handleSend = async () => {
    if (sending) return;
    if (!messageToSend.trim() && !mediaPreview) return;

    setSending(true);

    try {
      if (messageToSend.trim()) {
        socket.emit("send_message", {
          other_user_id: id,
          message: messageToSend.trim(),
          message_type: "text",
        });
        setMessageToSend("");
      }

      if (mediaPreview) {
        const data = await uploadChatMedia(mediaPreview);
        socket.emit("send_message", {
          other_user_id: id,
          message: data.url,
          message_type: mediaPreview.type,
        });
        clearMediaPreview();
      }
    } catch {
      showThemedError("Send failed", themeColors);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = () => {
    if (selectedMessage) {
      socket.emit("delete_message", {
        other_user_id: id,
        message_id: selectedMessage,
      });
      setDeleteMenuVisible(false);
    }
  };

  const backgroundImage =
    theme === "light"
      ? require("@/assets/images/chat-theme-light.jpg")
      : require("@/assets/images/chat-theme-dark.jpg");

  if (videoLoading)
    return (
      <Portal>
        <View className="w-full h-full bg-black">
          <LoadingScreen />
        </View>
      </Portal>
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTitle: () => <ChatHeader fetchResult={otherUserFetch} />,
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
              contentFit="cover"
              style={{
                paddingBottom: tabBarHeight + 15,
                backgroundColor: themeColors.chatBg,
                flex: 1,
              }}
            >
              <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={100}
                className="flex-1"
              >
                <DataLoader fetchResult={chat} pullToRefresh>
                  {(_, refreshing, onRefresh) => (
                    <>
                      {!socket?.connected && (
                        <Text className="text-center text-lg font-bold p-9 text-textPrimaryLight dark:text-textPrimaryDark">
                          Connecting...
                        </Text>
                      )}
                      {pressedMessage && (
                        <Pressable
                          className="absolute inset-0 z-10"
                          onPress={() => setPressedMessage(null)}
                        />
                      )}

                      <ChatMessagesList
                        messages={messages}
                        otherUser={otherUser}
                        pressedMessage={pressedMessage}
                        setPressedMessage={setPressedMessage}
                        setSelectedMessage={setSelectedMessage}
                        openDeleteMenu={() => setDeleteMenuVisible(true)}
                        openViewer={openImageViewer}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    </>
                  )}
                </DataLoader>

                {audioRecorderVisible && (
                  <View className="flex-row justify-center items-center">
                    <AudioRecorder
                      onRecordComplete={(uri) => {
                        if (uri) setMediaPreview({ uri, type: "audio" });
                        setAudioRecorderVisible(false);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setAudioRecorderVisible(false)}
                      className="bg-black/65 p-1 rounded-full m-2"
                    >
                      <MaterialIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                {mediaPreview && (
                  <ChatMediaPreview
                    mediaPreview={mediaPreview}
                    onClear={clearMediaPreview}
                    onViewImage={openImageViewer}
                    onPlayVideo={() => openVideoPlayer(mediaPreview.uri)}
                    onRecordAudio={() => {
                      setAudioRecorderVisible(true);
                      clearMediaPreview();
                    }}
                  />
                )}

                <ChatInputBar
                  messageToSend={messageToSend}
                  setMessageToSend={setMessageToSend}
                  sendButtonDisabled={sending}
                  handleSend={handleSend}
                  messagable={messagable}
                  openMediaMenu={() => setMediaMenuVisible(true)}
                  mediaPreview={mediaPreview}
                />
              </KeyboardAvoidingView>
            </ImageBackground>
          );
        }}
      </DataLoader>

      <MediaMenuModal
        visible={mediaMenuVisible}
        onDismiss={() => setMediaMenuVisible(false)}
        launchCamera={async () => {
          setMediaMenuVisible(false);
          const res = await launchCamera();
          if (res) setMediaPreview(res);
        }}
        pickPhoto={async () => {
          setMediaMenuVisible(false);
          const res = await pickPhoto();
          if (res) setMediaPreview(res);
        }}
        openAudioRecorder={() => {
          setMediaMenuVisible(false);
          setAudioRecorderVisible(true);
        }}
      />

      <DeleteMenuModal
        visible={deleteMenuVisible}
        onDismiss={() => setDeleteMenuVisible(false)}
        onDelete={handleDelete}
      />
    </>
  );
}
