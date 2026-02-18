import {
  View,
  Text,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { ImageBackground, Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState, useEffect } from "react";
import { useVideoPlayer, VideoThumbnail } from "expo-video";
import { launchCameraAsync, launchImageLibraryAsync } from "expo-image-picker";
import { lockAsync, OrientationLock } from "expo-screen-orientation";
import {
  getThumbnailAsync,
  VideoThumbnailsResult,
} from "expo-video-thumbnails";
import { useFetch } from "@/hooks/useFetch";
import DataLoader from "@/components/DataLoader";
import MessageItem from "@/components/MessageItem";
import { Message, User } from "@/types/chat";
import ProfilePicture from "@/components/ProfilePicture";
import ModalMenu from "@/components/ModalMenu";
import { formatFriendlyDate } from "@/services/date";
import { showThemedError } from "@/services/themed-error";
import { getSocket } from "@/services/socket";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessageTracker } from "@/contexts/MessageTrackerContext";
import { useSettings } from "@/contexts/SettingsContext";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import ImageViewing from "react-native-image-viewing";
import AudioRecorder from "@/components/AudioRecorder";
import FullScreenVideo from "@/components/FullScreenVideo";
import { apiFetch } from "@/services/api";

export default function OtherUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, themeColors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const chat = useFetch<Message[]>(`chat/${id}`);
  const otherUserFetch = useFetch<User>(`users/${id}`);
  const { setActiveChatUserId, markAsRead } = useMessageTracker();
  const { settings } = useSettings();
  const socket = getSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [pressedMessage, setPressedMessage] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{
    uri: string;
    type: "image" | "audio" | "video";
  } | null>(null);

  const [audioRecorderVisible, setAudioRecorderVisible] = useState(false);

  const [videoThumbnail, setVideoThumbnail] =
    useState<VideoThumbnailsResult | null>(null);
  const player = useVideoPlayer(videoThumbnail, (player) => {
    player.play();
  });

  useEffect(() => {
    if (!mediaPreview || mediaPreview.type !== "video") return;

    const fetchThumbnail = async () => {
      setVideoThumbnail(await getThumbnailAsync(mediaPreview.uri));
    };

    fetchThumbnail();
  }, [mediaPreview]);

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);

  useEffect(() => {
    if (!videoPlayerVisible || !player) return;

    const fetchVideoDims = async () => {
      if (!videoThumbnail?.width || !videoThumbnail?.height) return;

      if (videoThumbnail?.width > videoThumbnail?.height) {
        await lockAsync(OrientationLock.LANDSCAPE);
      } else {
        await lockAsync(OrientationLock.PORTRAIT);
      }
    };
    fetchVideoDims();
    return () => {
      lockAsync(OrientationLock.DEFAULT);
    };
  }, [videoPlayerVisible, player]);

  const openViewer = (image: string) => {
    setViewerImage(image);
    setViewerVisible(true);
  };
  const closeViewer = () => setViewerVisible(false);

  const openMediaMenu = () => setMediaMenuVisible(true);
  const closeMediaMenu = () => setMediaMenuVisible(false);

  const openDeleteMenu = () => setDeleteMenuVisible(true);

  const openAudioRecorder = () => setAudioRecorderVisible(true);
  const closeAudioRecorder = () => setAudioRecorderVisible(false);

  const openVideoPlayer = () => setVideoPlayerVisible(true);
  const closeVideoPlayer = () => setVideoPlayerVisible(false);

  const launchCamera = async () => {
    closeMediaMenu();
    const result = await launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0].type === "image") {
      setMediaPreview({
        uri: result.assets[0].uri,
        type: result.assets[0].type,
      });
    }
  };

  const pickPhoto = async () => {
    closeMediaMenu();

    const result = await launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.7,
    });

    if (
      !result.canceled &&
      (result.assets[0].type === "image" || result.assets[0].type === "video")
    ) {
      setMediaPreview({
        uri: result.assets[0].uri,
        type: result.assets[0].type,
      });
    }
  };

  const uploadAndSend = async (media: { uri: string; type: string }) => {
    const uriParts = media.uri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append("file", {
      uri: media.uri,
      name: `file.${fileType}`,
      type: `${media.type}/${fileType}`,
    } as any);

    try {
      const res = await apiFetch("chat-media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);

      socket.emit("send_message", {
        other_user_id: id,
        message: data.url,
        message_type: media.type,
      });

      setMediaPreview(null);
    } catch (err: any) {
      showThemedError(err.message, themeColors);
    }
  };

  const handleSend = async () => {
    if (!socket) return;
    if (messageToSend.trim()) {
      socket.emit("send_message", {
        other_user_id: id,
        message: messageToSend.trim(),
        message_type: "text",
      });
      setMessageToSend("");
    }
    if (mediaPreview) await uploadAndSend(mediaPreview);
  };

  const handleDelete = (message_id: string) =>
    socket.emit("delete_message", { other_user_id: id, message_id });
  const handleMarkRead = () => {
    if (socket && settings.sendReceipts)
      socket.emit("mark_as_read", { other_user_id: id });
  };

  useEffect(() => {
    if (chat.data) setMessages(chat.data);
  }, [chat.data]);
  useEffect(() => {
    setActiveChatUserId(id);
    markAsRead(id);
    return () => setActiveChatUserId(null);
  }, [id]);

  useEffect(() => {
    socket.emit("join_room", { other_user_id: id });
    if (settings.sendReceipts)
      socket.emit("mark_as_read", { other_user_id: id });
    handleMarkRead();

    const handleNewMessage = (msg: Message) =>
      setMessages((prev) =>
        prev.find((m) => m.message_id === msg.message_id)
          ? prev
          : [msg, ...prev],
      );
    const handleDeleteMessage = ({ message_id }: { message_id: string }) =>
      setMessages((prev) => prev.filter((m) => m.message_id !== message_id));
    const handleWsError = (data: { action: string; error: string }) =>
      showThemedError(`${data.action}\n${data.error}`, themeColors);

    socket.on("new_message", handleNewMessage);
    socket.on("delete_message", handleDeleteMessage);
    socket.on("ws_error", handleWsError);

    return () => {
      socket.emit("leave_room", { other_user_id: id });
      socket.off("new_message", handleNewMessage);
      socket.off("delete_message", handleDeleteMessage);
      socket.off("ws_error", handleWsError);
    };
  }, [id, themeColors, settings.sendReceipts]);

  const backgroundImage =
    theme === "light"
      ? require("@/assets/images/chat-theme-light.jpg")
      : require("@/assets/images/chat-theme-dark.jpg");

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTitle: () => (
            <DataLoader fetchResult={otherUserFetch}>
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
                      <FlatList
                        data={messages}
                        inverted
                        keyExtractor={(item) => item.message_id}
                        className="px-4"
                        refreshing={refreshing ?? false}
                        onRefresh={onRefresh}
                        ListFooterComponent={<View className="h-12 w-full" />}
                        renderItem={({ item }) => (
                          <>
                            {pressedMessage === item.message_id && (
                              <Text
                                className={`text-sm font-light pb-5 ${item.sender_id === otherUser.user_id ? "text-left pl-3 text-gray-200" : "text-right pr-3 text-gray-200"}`}
                              >
                                Sent at {formatFriendlyDate(item.sent_at)}
                              </Text>
                            )}
                            <MessageItem
                              other_user={otherUser || null}
                              item={item}
                              openViewer={openViewer}
                              onPress={(e) => {
                                e.stopPropagation();
                                setPressedMessage((prev) =>
                                  prev === item.message_id
                                    ? null
                                    : item.message_id,
                                );
                              }}
                              onLongPress={() => {
                                if (item.sender_id !== otherUser.user_id) {
                                  openDeleteMenu();
                                  setSelectedMessage(item.message_id);
                                }
                              }}
                            />
                          </>
                        )}
                      />
                    </>
                  )}
                </DataLoader>

                {audioRecorderVisible && (
                  <AudioRecorder
                    onRecordComplete={(uri) => {
                      setMediaPreview({ uri: uri || "", type: "audio" });
                      closeAudioRecorder();
                    }}
                  />
                )}

                {mediaPreview && (
                  <View className="mx-5 my-2 relative">
                    {mediaPreview.type === "image" && (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => openViewer(mediaPreview.uri)}
                      >
                        <Image
                          source={{ uri: mediaPreview.uri }}
                          style={{ width: 96, height: 96, borderRadius: 8 }}
                        />
                      </TouchableOpacity>
                    )}
                    {mediaPreview.type === "audio" && (
                      <TouchableOpacity
                        onPress={openAudioRecorder}
                        className="p-2 bg-gray-700 rounded-md"
                      >
                        <Text className="text-white">Play Audio</Text>
                      </TouchableOpacity>
                    )}
                    {mediaPreview.type === "video" && (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={openVideoPlayer}
                      >
                        <ImageBackground
                          source={{ uri: videoThumbnail?.uri || "" }}
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: 8,
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          <FontAwesome5
                            name="play-circle"
                            size={42}
                            color="black"
                            className="opacity-70"
                          />
                        </ImageBackground>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => setMediaPreview(null)}
                      className="absolute -top-1 -left-1 bg-black/40 p-1 rounded-full m-2"
                    >
                      <MaterialIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

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
                    placeholder={
                      messagable
                        ? "Type a message"
                        : "You can't message this user"
                    }
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
              </KeyboardAvoidingView>
            </ImageBackground>
          );
        }}
      </DataLoader>
      <ModalMenu
        visible={mediaMenuVisible}
        onDismiss={closeMediaMenu}
        actions={[
          {
            label: "Take photo",
            icon: (
              <Entypo name="camera" size={20} color={themeColors.textPrimary} />
            ),
            onPress: launchCamera,
          },
          {
            label: "Choose a photo/video",
            icon: (
              <FontAwesome6
                name="photo-film"
                size={17}
                color={themeColors.textPrimary}
              />
            ),
            onPress: pickPhoto,
          },
          {
            label: "Record audio",
            icon: (
              <FontAwesome5
                name="microphone"
                size={22}
                color={themeColors.textPrimary}
              />
            ),
            onPress: openAudioRecorder,
          },
        ]}
      />
      <ModalMenu
        visible={deleteMenuVisible}
        onDismiss={() => setDeleteMenuVisible(false)}
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
            onPress: () => {
              if (selectedMessage) handleDelete(selectedMessage);
              setDeleteMenuVisible(false);
            },
          },
        ]}
      />
      <ImageViewing
        presentationStyle="overFullScreen"
        images={viewerImage ? [{ uri: viewerImage }] : []}
        animationType="slide"
        swipeToCloseEnabled={true}
        imageIndex={0}
        visible={viewerVisible}
        onRequestClose={closeViewer}
      />
      <FullScreenVideo
        player={player}
        onClose={closeVideoPlayer}
        videoThumbnail={videoThumbnail}
        visible={videoPlayerVisible}
      />
    </>
  );
}
