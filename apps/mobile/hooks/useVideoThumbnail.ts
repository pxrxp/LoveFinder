import { useEffect, useState } from "react";
import {
  getThumbnailAsync,
  VideoThumbnailsResult,
} from "expo-video-thumbnails";
import { useVideoPlayer } from "expo-video";

export function useVideoThumbnail(uri?: string) {
  const [thumbnail, setThumbnail] =
    useState<VideoThumbnailsResult | null>(
      null
    );

  useEffect(() => {
    if (!uri) return;

    getThumbnailAsync(uri).then(setThumbnail);
  }, [uri]);

  const player = useVideoPlayer(
    thumbnail,
    (player) => player.play()
  );

  return {
    thumbnail,
    player,
  };
}
