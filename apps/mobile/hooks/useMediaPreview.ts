import { useState } from "react";

export type MediaPreview = {
  uri: string;
  type: "image" | "video" | "audio";
};

export function useMediaPreview() {
  const [mediaPreview, setMediaPreview] =
    useState<MediaPreview | null>(null);

  const clearMediaPreview = () =>
    setMediaPreview(null);

  return {
    mediaPreview,
    setMediaPreview,
    clearMediaPreview,
  };
}
