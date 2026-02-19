import { View, Text } from "react-native";
import ProfilePicture from "./ProfilePicture";
import DataLoader from "./DataLoader";
import { User } from "@/types/chat";
import { useTheme } from "@/contexts/ThemeContext";

export default function ChatHeader({
  fetchResult,
}: {
  fetchResult: any;
}) {
  const { themeColors } = useTheme();

  return (
    <DataLoader fetchResult={fetchResult}>
      {(user: User) => (
        <View className="flex-row items-center">
          <ProfilePicture
            url={user.profile_picture_url}
            size={40}
            color={themeColors.textPrimary}
          />

          <Text className="text-xl font-bold pt-2 pl-5 text-textPrimaryLight dark:text-textPrimaryDark">
            {user.full_name}
          </Text>
        </View>
      )}
    </DataLoader>
  );
}
