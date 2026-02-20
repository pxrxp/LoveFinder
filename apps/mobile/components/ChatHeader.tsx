import { View, Text, Pressable } from "react-native";
import ProfilePicture from "@/components/ProfilePicture";
import DataLoader from "@/components/DataLoader";
import { User } from "@/types/User";
import { useTheme } from "@/contexts/ThemeContext";
import { useImageViewerContext } from "@/contexts/ImageViewerContext";

export default function ChatHeader({ fetchResult }: { fetchResult: any }) {
  const { themeColors } = useTheme();
  const { openImageViewer } = useImageViewerContext();

  return (
    <DataLoader fetchResult={fetchResult}>
      {(user: User) => (
        <View className="flex-row items-center">
          <Pressable
            onPress={() =>
              user.profile_picture_url &&
              openImageViewer(user.profile_picture_url)
            }
          >
            <ProfilePicture
              url={user.profile_picture_url}
              size={40}
              color={themeColors.textPrimary}
            />
          </Pressable>

          <Text className="text-xl font-bold pt-2 pl-5 text-textPrimaryLight dark:text-textPrimaryDark">
            {user.full_name}
          </Text>
        </View>
      )}
    </DataLoader>
  );
}
