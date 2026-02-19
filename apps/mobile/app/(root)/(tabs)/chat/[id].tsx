import {
  Text,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { ImageBackground } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState, useEffect, useCallback } from "react";
import { getThumbnailAsync, VideoThumbnailsResult } from "expo-video-thumbnails";

// Hooks & Contexts
import { useFetch } from "@/hooks/useFetch";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useMediaPreview } from "@/hooks/useMediaPreview";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessageTracker } from "@/contexts/MessageTrackerContext";
import { useSettings } from "@/contexts/SettingsContext";

// Global Contexts
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

export default function OtherUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, themeColors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { settings } = useSettings();

  // --- Global Context Hooks ---
  const { openImageViewer } = useImageViewerContext();
  const { openVideoPlayer } = useVideoPlayerContext();

  // --- Data Fetching ---
  const chat = useFetch<Message[]>(`chat/${id}`);
  const otherUserFetch = useFetch<User>(`users/${id}`);

  // --- Local State ---
  const { setActiveChatUserId, markAsRead } = useMessageTracker();
  const { mediaPreview, setMediaPreview, clearMediaPreview } = useMediaPreview();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [pressedMessage, setPressedMessage] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  
  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [audioRecorderVisible, setAudioRecorderVisible] = useState(false);
  
  // Local thumbnail state for the preview box only
  const [localVideoThumbnail, setLocalVideoThumbnail] = useState<VideoThumbnailsResult | null>(null);

  // --- Socket Logic ---
  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) =>
      prev.find((m) => m.message_id === msg.message_id) ? prev : [msg, ...prev]
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

  // --- Effects ---
  useEffect(() => { if (chat.data) setMessages(chat.data); }, [chat.data]);
  
  useEffect(() => {
    setActiveChatUserId(id);
    markAsRead(id);
    return () => setActiveChatUserId(null);
  }, [id, setActiveChatUserId, markAsRead]);

  // Generate thumbnail ONLY for the little preview box above the input bar
  useEffect(() => {
    if (mediaPreview?.type === "video") {
      getThumbnailAsync(mediaPreview.uri).then(setLocalVideoThumbnail).catch(console.error);
    } else {
      setLocalVideoThumbnail(null);
    }
  }, [mediaPreview]);

  // --- Actions ---
  const handleSend = async () => {
    if (!socket) return;
    if (messageToSend.trim()) {
      socket.emit("send_message", { other_user_id: id, message: messageToSend.trim(), message_type: "text" });
      setMessageToSend("");
    }
    if (mediaPreview) {
      try {
        const data = await uploadChatMedia(mediaPreview);
        socket.emit("send_message", { other_user_id: id, message: data.url, message_type: mediaPreview.type });
        clearMediaPreview();
      } catch {
        showThemedError("Upload failed", themeColors);
      }
    }
  };

  const handleDelete = () => {
    if (selectedMessage) {
      socket.emit("delete_message", { other_user_id: id, message_id: selectedMessage });
      setDeleteMenuVisible(false);
    }
  };

  const backgroundImage = theme === "light"
    ? require("@/assets/images/chat-theme-light.jpg")
    : require("@/assets/images/chat-theme-dark.jpg");

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
          const messagable = otherUser.allow_messages_from_strangers || otherUser.swipe_category === "them" || otherUser.swipe_category === "both";

          return (
            <ImageBackground
              source={backgroundImage}
              contentFit="cover"
              style={{ paddingBottom: tabBarHeight + 15, backgroundColor: themeColors.chatBg, flex: 1 }}
            >
              <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100} className="flex-1">
                <DataLoader fetchResult={chat} pullToRefresh>
                  {(_, refreshing, onRefresh) => (
                    <>
                      {!socket?.connected && (
                        <Text className="text-center text-lg font-bold p-9 text-textPrimaryLight dark:text-textPrimaryDark">
                          Connecting...
                        </Text>
                      )}
                      {pressedMessage && <Pressable className="absolute inset-0 z-10" onPress={() => setPressedMessage(null)} />}
                      
                      <ChatMessagesList
                        messages={messages}
                        otherUser={otherUser}
                        pressedMessage={pressedMessage}
                        setPressedMessage={setPressedMessage}
                        setSelectedMessage={setSelectedMessage}
                        openDeleteMenu={() => setDeleteMenuVisible(true)}
                        openViewer={openImageViewer} // Passing the global context function
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    </>
                  )}
                </DataLoader>

                {audioRecorderVisible && (
                  <AudioRecorder
                    onRecordComplete={(uri) => {
                      if (uri) setMediaPreview({ uri, type: "audio" });
                      setAudioRecorderVisible(false);
                    }}
                  />
                )}

                {mediaPreview && (
                  <ChatMediaPreview
                    mediaPreview={mediaPreview}
                    videoThumbnail={localVideoThumbnail}
                    onClear={clearMediaPreview}
                    onViewImage={openImageViewer} // Global Context
                    onPlayVideo={() => openVideoPlayer(mediaPreview.uri)} // Global Context
                    onRecordAudio={() => setAudioRecorderVisible(true)}
                  />
                )}

                <ChatInputBar
                  messageToSend={messageToSend}
                  setMessageToSend={setMessageToSend}
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
        launchCamera={async () => { setMediaMenuVisible(false); const res = await launchCamera(); if (res) setMediaPreview(res); }}
        pickPhoto={async () => { setMediaMenuVisible(false); const res = await pickPhoto(); if (res) setMediaPreview(res); }}
        openAudioRecorder={() => { setMediaMenuVisible(false); setAudioRecorderVisible(true); }}
      />

      <DeleteMenuModal
        visible={deleteMenuVisible}
        onDismiss={() => setDeleteMenuVisible(false)}
        onDelete={handleDelete}
      />
    </>
  );
}
