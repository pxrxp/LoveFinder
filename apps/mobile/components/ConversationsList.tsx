import { Text, View, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { useTheme } from "@/contexts/ThemeContext";
import ProfilePicture from "@/components/ProfilePicture";
import DataLoader from "@/components/DataLoader";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext, useState, useEffect } from "react";
import { Conversation } from "@/types/Conversation";
import ModalMenu from "./ModalMenu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { showThemedError } from "@/services/themed-error";
import ReportModal from "./modals/ReportModal";
import ConfirmModal from "./modals/ConfirmModal";
import { Octicons, FontAwesome5 } from "@expo/vector-icons";
import {
  blockUser,
  ReportReason,
  reportUser,
  swipeUser,
  unswipeUser,
} from "@/services/user-actions";
import { showThemedSuccess } from "@/services/themed-success";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const TimeAgo = ({ date }: { date?: string }) => {
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (!date) return;
      let d = date.endsWith("Z") ? dayjs(date) : dayjs.utc(date).local();

      if (d.isAfter(dayjs())) d = dayjs();

      setTimeText(d.fromNow());
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [date]);

  return <Text className="text-gray-500 font-regular text-sm">{timeText}</Text>;
};

interface ConversationsListProps {
  conversations: Conversation[];
  loading: boolean;
  error?: any;
  unswipeVisible?: boolean;
  refetch: () => Promise<void>;
  extraData?: any;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export default function ConversationsList({
  conversations,
  loading,
  error,
  unswipeVisible = true,
  refetch,
  extraData,
  onLoadMore,
  loadingMore,
}: ConversationsListProps) {
  const { user } = useContext(AuthContext)!;
  const { themeColors } = useTheme();

  const [menuVisible, setMenuVisible] = useState(false);
  const [reportMenuVisible, setReportMenuVisible] = useState(false);
  const [confirmBlockMenuVisible, setConfirmBlockMenuVisible] = useState(false);
  const [longPressedUser, setLongPressedUser] = useState<string | null>(null);

  const handleSwipeBack = async () => {
    if (!longPressedUser) return;
    try {
      await swipeUser(longPressedUser, "like");
      setMenuVisible(false);
      await refetch();
    } catch (e: any) {
      showThemedError(e.message, themeColors);
    }
  };

  const handleUnswipe = async () => {
    if (!longPressedUser) return;
    try {
      await unswipeUser(longPressedUser);
      setMenuVisible(false);
      await refetch();
    } catch (e: any) {
      showThemedError(e.message, themeColors);
    }
  };

  const executeBlock = async () => {
    if (!longPressedUser) return;
    try {
      await blockUser(longPressedUser);
      setMenuVisible(false);
      await refetch();
    } catch (e: any) {
      showThemedError(e.message, themeColors);
    }
  };

  const handleReportSubmit = async (reason: ReportReason, details: string) => {
    if (!longPressedUser) return;
    try {
      await reportUser(longPressedUser, reason, details);
      setReportMenuVisible(false);
      setMenuVisible(false);
      showThemedSuccess("User has been reported to our team.", themeColors);
    } catch (e: any) {
      showThemedError(e.message, themeColors);
    }
  };

  return (
    <>
      <DataLoader
        fetchResult={{ data: conversations, loading, error, refetch }}
        pullToRefresh
      >
        {(conversations, refreshing, onRefresh) => (
          <FlashList
            data={conversations}
            extraData={extraData}
            keyExtractor={(item) => item.other_user_id}
            onRefresh={onRefresh}
            refreshing={refreshing ?? false}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            contentContainerClassName="px-7"
            ListEmptyComponent={
              <View className="flex-row justify-center py-10">
                <Entypo
                  name="emoji-sad"
                  size={64}
                  color={themeColors.textPrimary}
                />
                <Text className="text-textPrimaryLight dark:text-textPrimaryDark font-bold text-2xl ml-5 mt-5">
                  Nothing to see here!
                </Text>
              </View>
            }
            ListFooterComponent={<View className="w-full h-20" />}
            renderItem={({ item, index }) => (
              <Link
                onLongPress={() => {
                  setMenuVisible(true);
                  setLongPressedUser(item.other_user_id);
                }}
                href={`/chat/${item.other_user_id}`}
                asChild
              >
                <TouchableOpacity activeOpacity={0.5} className="my-5">
                  <View className="flex-row items-center w-full">
                    <ProfilePicture
                      url={item.profile_picture_url}
                      size={90}
                      color={themeColors.textPrimary}
                    />
                    <View className="flex-1 pl-5 py-3">
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-textPrimaryLight dark:text-textPrimaryDark font-bold text-xl"
                      >
                        {item.full_name}
                      </Text>
                      <View className="flex-row items-center w-full">
                        <TimeAgo date={item.last_message_sent_at} />
                        <View className="flex-1" />
                        <Text className="text-textPrimaryDark font-light bg-gray-500 px-2 py-1 rounded-full">
                          {item.last_message_sender_id === user?.user_id
                            ? "Their turn"
                            : "Your turn"}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className={`text-gray-500 ${item.last_message_type === "text" ? "font-regular" : "font-italic"}`}
                      >
                        {item.last_message_type
                          ? item.last_message_type === "text"
                            ? item.last_message
                            : "Sent an attachment."
                          : "Start conversation"}
                      </Text>
                      {index !== conversations.length - 1 && (
                        <View className="w-full h-[0.5px] bg-gray-500 relative top-3 rounded-full" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            )}
          />
        )}
      </DataLoader>

      <ModalMenu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        actions={[
          {
            label: unswipeVisible ? "Unswipe" : "Swipe back",
            icon: unswipeVisible ? (
              <Octicons name="undo" size={20} color={themeColors.textPrimary} />
            ) : (
              <FontAwesome5
                name="heart"
                size={20}
                color={themeColors.textPrimary}
              />
            ),
            onPress: unswipeVisible ? handleUnswipe : handleSwipeBack,
          },
          {
            label: "Report",
            icon: (
              <Octicons
                name="report"
                size={20}
                color={themeColors.textPrimary}
              />
            ),
            onPress: () => setReportMenuVisible(true),
          },
          {
            label: "Block",
            color: "red",
            icon: <Octicons name="blocked" size={20} color="red" />,
            onPress: () => setConfirmBlockMenuVisible(true),
          },
        ]}
      />
      <ReportModal
        visible={reportMenuVisible}
        onDismiss={() => setReportMenuVisible(false)}
        onSubmit={handleReportSubmit}
      />
      <ConfirmModal
        visible={confirmBlockMenuVisible}
        title="Block User"
        description="Are you sure? This conversation will disappear."
        confirmLabel="Block"
        onDismiss={() => setConfirmBlockMenuVisible(false)}
        onConfirm={executeBlock}
      />
    </>
  );
}
