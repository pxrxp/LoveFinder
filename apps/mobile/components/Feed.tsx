import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useEffect, useState, memo, useCallback } from "react";
import { FeedUser } from "@/types/FeedUser";
import Card from "@/components/Card";
import DataLoader from "@/components/DataLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { Entypo } from "@expo/vector-icons";

const MemoizedCard = memo(Card);

interface FeedProps {
  data: FeedUser[] | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export default function Feed({ data, loading, error, refetch }: FeedProps) {
  const { themeColors } = useTheme();
  const [cards, setCards] = useState<FeedUser[]>([]);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    if (data) setCards([...data].reverse());
  }, [data]);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.user_id !== id));
  }, []);

  return (
    <DataLoader fetchResult={{ data, loading, error, refetch }} pullToRefresh>
      {(_, refreshing, onRefresh) => (
        <View className="flex-1 relative">
          {cards.length === 0 && !loading ? (
            <ScrollView
              contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              refreshControl={<RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} tintColor={themeColors.textPrimary} />}
            >
              <Entypo name="emoji-neutral" size={64} color={themeColors.textPrimary} />
              <Text className="text-textPrimaryLight dark:text-textPrimaryDark font-bold text-2xl mt-5">No one new!</Text>
            </ScrollView>
          ) : (
            cards.map((item, index) => {
              if (index < cards.length - 3) return null;
              return (
                <MemoizedCard
                  key={item.user_id}
                  item={item}
                  isTop={index === cards.length - 1}
                  bioExpanded={bioExpanded}
                  setBioExpanded={setBioExpanded}
                  onRemove={() => removeCard(item.user_id)}
                />
              );
            })
          )}
        </View>
      )}
    </DataLoader>
  );
}
