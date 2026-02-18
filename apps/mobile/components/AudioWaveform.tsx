import { useTheme } from "@/contexts/ThemeContext";
import { View, LayoutChangeEvent } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useState, useMemo } from "react";

export default function AudioWaveform({
  levels,
  className,
  targetBars = 30,
  min_db = -60,
  max_db = 0,
}: {
  levels: number[];
  className: string;
  targetBars?: number;
  min_db?: number;
  max_db?: number;
}) {
  const { themeColors } = useTheme();

  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const bars = useMemo(() => {
    if (size.width === 0 || size.height === 0) return [];

    const barWidth = (size.width / targetBars) * 0.6;
    const spacing = (size.width / targetBars) * 0.4;

    const maxBars = Math.floor(size.width / (barWidth + spacing));
    const visibleLevels = levels.slice(-maxBars);

    const halfHeight = size.height / 2;

    return visibleLevels.map((level, index) => {
      const clamped = Math.max(min_db, Math.min(level, max_db));
      const normalized = (clamped - min_db) / (max_db - min_db);

      const barHeight = Math.max(2, normalized * size.height);

      const x = index * (barWidth + spacing);
      const y = halfHeight - barHeight / 2;

      return (
        <Rect
          key={index}
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={themeColors.textPrimary}
          rx={barWidth / 2}
        />
      );
    });
  }, [levels, size, themeColors]);

  return (
    <View className={`${className} flex-row`} onLayout={onLayout}>
      <Svg width="100%" height="100%">
        {bars}
      </Svg>
    </View>
  );
}
