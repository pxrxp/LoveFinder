import { useContext } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { AuthContext } from "@/contexts/AuthContext";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export default function SettingsModal({ visible, onDismiss }: Props) {
  const { theme, toggleTheme, themeColors } = useTheme();
  const { settings, setSetting } = useSettings();
  const { logout } = useContext(AuthContext)!;

  const SettingRow = ({
    icon,
    label,
    value,
    onValueChange,
    isSwitch = true,
  }: {
    icon: React.ReactNode;
    label: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
    isSwitch?: boolean;
  }) => (
    <View
      className="flex-row items-center justify-between py-4 border-b"
      style={{ borderColor: themeColors.textPrimary + "10" }}
    >
      <View className="flex-row items-center">
        <View className="w-10 items-center justify-center mr-3">
          {icon}
        </View>
        <Text
          className="text-base font-semibold"
          style={{ color: themeColors.textPrimary }}
        >
          {label}
        </Text>
      </View>
      
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#767577", true: "#FF5A5F" }}
          thumbColor={Platform.OS === "android" ? "#f4f3f4" : ""}
          ios_backgroundColor="#3e3e3e"
        />
      ) : (
        <TouchableOpacity onPress={() => onValueChange(!value)}>
          <Feather
            name={value ? "moon" : "sun"}
            size={24}
            color={themeColors.textPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable onPress={onDismiss} className="flex-1 bg-black/60 justify-end">
        <Pressable
          className="rounded-t-3xl p-6 shadow-2xl"
          style={{ backgroundColor: themeColors.bgPrimary }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className="text-xl font-bold"
              style={{ color: themeColors.textPrimary }}
            >
              Settings
            </Text>
            <TouchableOpacity onPress={onDismiss} className="p-2 -mr-2">
              <AntDesign
                name="close"
                size={24}
                color={themeColors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <SettingRow
              label="Dark Mode"
              value={theme === "dark"}
              onValueChange={toggleTheme}
              isSwitch={true}
              icon={
                <Ionicons
                  name="moon-outline"
                  size={22}
                  color={themeColors.textPrimary}
                />
              }
            />

            <SettingRow
              label="Read Receipts"
              value={settings.sendReceipts}
              onValueChange={(val) => setSetting("sendReceipts", val)}
              icon={
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={24}
                  color={themeColors.textPrimary}
                />
              }
            />

            <SettingRow
              label="In-app Notifications"
              value={settings.getNotifications}
              onValueChange={(val) => setSetting("getNotifications", val)}
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={themeColors.textPrimary}
                />
              }
            />

            <TouchableOpacity
              onPress={() => {
                onDismiss();
                logout();
              }}
              className="mt-8 bg-red-500 rounded-2xl py-3.5 flex-row items-center justify-center shadow-sm"
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name="logout" 
                size={20} 
                color="white" 
                style={{ marginRight: 8 }} 
              />
              <Text className="text-white font-bold text-base">
                Log Out
              </Text>
            </TouchableOpacity>
            
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
