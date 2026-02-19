import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { useVideoPlayer } from "expo-video";
import {
  getThumbnailAsync,
  VideoThumbnailsResult,
} from "expo-video-thumbnails";

import * as ScreenOrientation from "expo-screen-orientation";

import FullScreenVideo from "../components/FullScreenVideo";

type ContextType = {
  openVideoPlayer: (uri: string) => Promise<void>;
  thumbnail: VideoThumbnailsResult | null;
};

const VideoPlayerContext = createContext<ContextType | undefined>(undefined);

export const VideoPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<VideoThumbnailsResult | null>(
    null,
  );

  const player = useVideoPlayer(
    videoUri ? { uri: videoUri } : null,
    (player) => {
      player.play();
    },
  );

  const openVideoPlayer = async (uri: string) => {
    setThumbnail(await getThumbnailAsync(uri));
    setVideoUri(uri);
    setVisible(true);
  };

  const closeVideoPlayer = () => {
    setVisible(false);
    setVideoUri(null);
    setThumbnail(null);
  };

  useEffect(() => {
    if (!visible || !thumbnail) return;

    const lock = async () => {
      await ScreenOrientation.lockAsync(
        thumbnail.width > thumbnail.height
          ? ScreenOrientation.OrientationLock.LANDSCAPE
          : ScreenOrientation.OrientationLock.PORTRAIT,
      );
    };

    lock();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, [visible, thumbnail]);

  return (
    <VideoPlayerContext.Provider value={{ openVideoPlayer, thumbnail }}>
      {children}

      <FullScreenVideo
        player={player}
        visible={visible}
        videoThumbnail={thumbnail}
        onClose={closeVideoPlayer}
      />
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayerContext = () => {
  const ctx = useContext(VideoPlayerContext);

  if (!ctx) {
    throw new Error("Must be used inside VideoPlayerProvider");
  }

  return ctx;
};
