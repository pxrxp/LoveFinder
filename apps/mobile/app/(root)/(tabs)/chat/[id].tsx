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
import { useState, useEffect, useCallback, useContext } from "react";

import { useFetch } from "@/hooks/useFetch";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useMediaPreview } from "@/hooks/useMediaPreview";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessageTracker } from "@/contexts/MessageTrackerContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useImageViewerContext } from "@/contexts/ImageViewerContext";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import { AuthContext } from "@/contexts/AuthContext";

import { uploadChatMedia } from "@/services/chat-media";
import { pickPhoto, launchCamera } from "@/services/media-picker";
import { showThemedError } from "@/services/themed-error";

import DataLoader from "@/components/DataLoader";
import ChatHeader from "@/components/ChatHeader";
import ChatMessagesList from "@/components/ChatMessagesList";
import ChatInputBar from "@/components/ChatInputBar";
import ChatMediaPreview from "@/components/ChatMediaPreview";
import MediaMenuModal from "@/components/modals/MediaMenuModal";
import DeleteMenuModal from "@/components/modals/DeleteMenuModal";
import AudioRecorder from "@/components/AudioRecorder";

import { Message, User } from "@/types/chat";
import { MaterialIcons } from "@expo/vector-icons";
import LoadingScreen from "@/components/LoadingScreen";
import { Portal } from "@gorhom/portal";

import dayjs from "dayjs";
import { apiFetch } from "@/services/api";

export default function OtherUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, themeColors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { settings } = useSettings();
  const { user } = useContext(AuthContext)!;

  const { openImageViewer } = useImageViewerContext();
  const { openVideoPlayer, loading: videoLoading } = useVideoPlayerContext();

  const chat = useFetch<Message[]>(`chat/${id}`);
  const otherUserFetch = useFetch<User>(`users/${id}`);
  const { setActiveChatUserId, markAsRead } = useMessageTracker();

  const { mediaPreview, setMediaPreview, clearMediaPreview } = useMediaPreview();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [pressedMessage, setPressedMessage] = useState<string | null>(null);
  const [longPressedMessage, setLongPressedMessage] = useState<string | null>(null);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);

  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [audioRecorderVisible, setAudioRecorderVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const handleNewMessage = useCallback((msg: Message) => {
    const serverDate = dayjs(msg.sent_at);
    const safeMsg = {
        ...msg,
        sent_at: serverDate.isAfter(dayjs()) ? dayjs().toISOString() : msg.sent_at
    };

    setMessages((prev) => {
      if (prev.find((m) => m.message_id === safeMsg.message_id)) return prev;

      const tempMatch = prev.find(
        (m) =>
          m.message_content === safeMsg.message_content &&
          m.message_type === safeMsg.message_type &&
          m.sender_id === safeMsg.sender_id &&
          m.message_id.length < 20
      );

      if (tempMatch) {
        return prev.map((m) => (m.message_id === tempMatch.message_id ? safeMsg : m));
      }

      return [...prev, safeMsg];
    });
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

  useEffect(() => {
    if (chat.data) {
        setMessages((prev) => {
            const serverMsgs = chat.data || [];
            const optimisticMsgs = prev.filter(m => m.message_id.length < 20);
            
            const combined = [...optimisticMsgs, ...serverMsgs];
            const unique = Array.from(new Map(combined.map(m => [m.message_id, m])).values());
            
            return unique.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
        });
    }
  }, [chat.data]);

  useEffect(() => {
    setActiveChatUserId(id);
    markAsRead(id);
    return () => setActiveChatUserId(null);
  }, [id]);

  const loadOlderMessages = async () => {
    if (loadingOlderMessages || messages.length === 0) return;
    
    setLoadingOlderMessages(true);
    const cursor = messages[0].sent_at;

    try {
      const res = await apiFetch(`chat/${id}?cursor=${encodeURIComponent(cursor)}&limit=20`);
      const older: Message[] = await res.json();

      if (older.length > 0) {
        setMessages((prev) => {
          const combined = [...older, ...prev];
          const unique = Array.from(new Map(combined.map((m) => [m.message_id, m])).values());
          return unique.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
        });
      }
    } catch (e: any) {
      showThemedError(e.message, themeColors);
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const handleSend = async () => {
    if (sending) return;
    if (!messageToSend.trim() && !mediaPreview) return;

    setSending(true);

    try {
      if (messageToSend.trim()) {
        const textContent = messageToSend.trim();
        const tempMsg: Message = {
          message_id: Date.now().toString(),
          sender_id: user!.user_id,
          message_content: textContent,
          message_type: "text",
          sent_at: new Date().toISOString(),
          is_read: false,
        };
        
        setMessages((prev) => [...prev, tempMsg]);
        setMessageToSend("");

        socket.emit("send_message", {
          other_user_id: id,
          message: textContent,
          message_type: "text",
        });
      }

      if (mediaPreview) {
        const type = mediaPreview.type;
        const uploadUri = mediaPreview.uri;
        
        clearMediaPreview();

        const data = await uploadChatMedia({ uri: uploadUri, type });
        
        const tempMsg: Message = {
          message_id: Date.now().toString(),
          sender_id: user!.user_id,
          message_content: data.url,
          message_type: type,
          sent_at: new Date().toISOString(),
          is_read: false,
        };

        setMessages((prev) => [...prev, tempMsg]);

        socket.emit("send_message", {
          other_user_id: id,
          message: data.url,
          message_type: type,
        });
      }
    } catch (e: any) {
      showThemedError("Send failed: " + e.message, themeColors);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = () => {
    if (longPressedMessage) {
      socket.emit("delete_message", {
        other_user_id: id,
        message_id: longPressedMessage,
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
                  {() => (
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
                        setSelectedMessage={setLongPressedMessage}
                        openDeleteMenu={() => setDeleteMenuVisible(true)}
                        loadOlderMessages = {loadOlderMessages}
                        loadingOlderMessages = {loadingOlderMessages}
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
