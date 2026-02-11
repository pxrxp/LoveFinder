import { useFetch } from "@/hooks/useFetch";
import { apiFetch } from "@/services/api";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function HomeScreen() {
  const { data, error, loading, refetch } = useFetch("feed");

  const x = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      x.value = event.translationX;
    })
    .onEnd(() => {
      x.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              backgroundColor: "blue",
              borderRadius: 20,
            },
            style,
          ]}
        />
      </GestureDetector>
      <FlatList
        data={data}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => <></>}
      />
    </SafeAreaView>
  );
}
