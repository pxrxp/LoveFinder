import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

export type WheelPickerOption = {
  label: string;
  value: string | number;
};

const ITEM_HEIGHT = 50;

export function WheelPickerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row justify-center items-center h-[210px] w-full overflow-hidden">
      {children}
    </View>
  );
}

export function WheelPicker({
  options,
  value,
  onValueChange,
}: {
  options: WheelPickerOption[];
  value: string | number;
  onValueChange: (v: any) => void;
}) {
  const { themeColors } = useTheme();
  const flatListRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = options.findIndex((o) => o.value === value);
    if (index !== -1) {
      (flatListRef.current as any)?.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [value]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const selected = options[index];
    if (selected && selected.value !== value) {
      onValueChange(selected.value);
      if (Platform.OS !== "web") Haptics.selectionAsync();
    }
  };

  return (
    <View style={{ height: ITEM_HEIGHT * 3, flex: 1 }}>
      <View
        pointerEvents="none"
        className="absolute top-[50px] left-2 right-2 border-y border-accent bg-accent/5"
        style={{ height: ITEM_HEIGHT }}
      />

      <ScrollView
        ref={flatListRef as any}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT,
        }}
      >
        {options.map((item, _index) => (
          <View
            key={`wheel-opt-${item.value.toString()}`}
            style={{ height: ITEM_HEIGHT }}
            className="justify-center items-center"
          >
            <Text
              className={`text-xl font-bold`}
              style={{
                color:
                  item.value === value
                    ? themeColors.accent
                    : themeColors.textSecondary,
              }}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
