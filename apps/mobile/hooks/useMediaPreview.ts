import { MediaPreview } from "@/types/MediaPreview";
import { useState } from "react";

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
