import { StyleSheet, Text } from "react-native";
import { Tabs } from "expo-router";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === "android";

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: isAndroid ? 48 + insets.bottom : 65 + insets.bottom,
          paddingBottom: isAndroid ? 4 : 10,
        },
        tabBarLabel: ({ focused, children }) => (
          <Text
            style={{
              fontWeight: focused ? '700' : '400',
            }}
          >
            {children}
          </Text>
        ),
        tabBarLabelStyle: styles.iconLabel,
        tabBarBadgeStyle: styles.badge,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaskedView
                maskElement={
                  <MaterialCommunityIcons
                    name="heart-multiple"
                    style={styles.focusedIcon}
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
                style={styles.unfocusedIcon}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: "Chat",
          tabBarBadge: '',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="chatbubble" style={styles.focusedIcon} />
            ) : (
              <Ionicons
                name="chatbubble-outline"
                style={styles.unfocusedIcon}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person" style={styles.focusedIcon} />
            ) : (
              <Ionicons name="person-outline" style={styles.unfocusedIcon} />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  focusedIcon: {
    fontSize: 27,
    color: "black",
  },
  unfocusedIcon: {
    fontSize: 24,
    color: "gray",
  },
  iconLabel: {
    paddingTop: 3,
    fontSize: 12,
  },
  badge: {
    backgroundColor: "#FD267D",
    minWidth: 9,
    height: 9,
  },
});
