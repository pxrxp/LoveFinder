import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function ProfileScreen() {
  const {login, loading, user, logout} = useContext(AuthContext)!;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Profile</Text>
      <Pressable onPress={logout}><Text>Log out</Text></Pressable>
    </View>
  );
}
