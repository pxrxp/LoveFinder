import { Text, View, Platform } from "react-native";
import { Tabs } from "expo-router";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useUnreadCount, ConversationsProvider } from "@/contexts/ConversationsContext";

function TabsContent() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === "android";
  const { themeColors } = useTheme();

  useMessageNotifications();
  const { unreadCount } = useUnreadCount();

  const renderLabel = (label: string, focused: boolean) => (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      className="text-sm font-regular px-1"
      style={{
        includeFontPadding: false,
        fontWeight: focused ? "700" : "400",
        color: focused ? themeColors.textPrimary : themeColors.tabIconInactive,
      }}
    >
      {label}
    </Text>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: isAndroid ? 60 + insets.bottom : 77 + insets.bottom,
          paddingBottom: isAndroid ? 4 : 10,
          paddingTop: 3,
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: themeColors.bgPrimary }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused }) => renderLabel("Swipe", focused),
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaskedView
                maskElement={
                  <MaterialCommunityIcons
                    name="heart-multiple"
                    size={27}
                    color={themeColors.textPrimary}
                  />
                }
              >
                <LinearGradient
                  colors={["#FD267D", "#FE6D58"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ width: 28, height: 28 }}
                />
              </MaskedView>
            ) : (
              <MaterialCommunityIcons
                name="heart-multiple-outline"
                size={24}
                color={themeColors.tabIconInactive}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: ({ focused }) => renderLabel("Chat", focused),
          tabBarIcon: ({ focused }) => (
            <View>
              <Ionicons
                name={focused ? "chatbubble" : "chatbubble-outline"}
                size={focused ? 27 : 24}
                color={
                  focused ? themeColors.textPrimary : themeColors.tabIconInactive
                }
              />
              {unreadCount > 0 && !focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: "#c0010f",
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: ({ focused }) => renderLabel("Profile", focused),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? 27 : 24}
              color={
                focused ? themeColors.textPrimary : themeColors.tabIconInactive
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <ConversationsProvider>
      <TabsContent />
    </ConversationsProvider>
  );
}
