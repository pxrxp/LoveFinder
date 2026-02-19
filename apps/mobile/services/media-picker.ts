import { launchCameraAsync, launchImageLibraryAsync } from "expo-image-picker";

export type MediaPreview = { uri: string; type: "image" | "video" | "audio" };

export async function pickPhoto(): Promise<MediaPreview | null> {
  const result = await launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    quality: 0.7,
  });

  if (!result.canceled && (result.assets[0].type === "image" || result.assets[0].type === "video")) {
    return { uri: result.assets[0].uri, type: result.assets[0].type };
  }
  return null;
}

export async function launchCamera(): Promise<MediaPreview | null> {
  const result = await launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.7,
  });

  if (!result.canceled && result.assets[0].type === "image") {
    return { uri: result.assets[0].uri, type: "image" };
  }
  return null;
}
