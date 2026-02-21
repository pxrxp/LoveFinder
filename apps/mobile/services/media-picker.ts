import { launchCameraAsync, launchImageLibraryAsync } from "expo-image-picker";
import { MediaPreview } from "@/types/Media";

interface MediaProps {
  videosAllowed?: boolean;
  allowsEditing?: boolean;
}

export async function pickMedia(
  props?: MediaProps,
): Promise<MediaPreview | null> {
  const { videosAllowed = true, allowsEditing = false } = props || {};
  const result = await launchImageLibraryAsync({
    mediaTypes: videosAllowed ? ["images", "videos"] : ["images"],
    quality: 0.7,
    allowsEditing,
    aspect: allowsEditing ? [1, 1] : undefined,
    allowsMultipleSelection: false,
  });

  if (
    !result.canceled &&
    (result.assets[0].type === "image" ||
      (videosAllowed && result.assets[0].type === "video"))
  ) {
    return { uri: result.assets[0].uri, type: result.assets[0].type };
  }
  return null;
}

export async function launchCamera(
  props?: MediaProps,
): Promise<MediaPreview | null> {
  const { videosAllowed = true, allowsEditing = false } = props || {};
  const result = await launchCameraAsync({
    mediaTypes: videosAllowed ? ["images", "videos"] : ["images"],
    quality: 0.7,
    allowsEditing,
    aspect: allowsEditing ? [1, 1] : undefined,
    allowsMultipleSelection: false,
  });

  if (
    !result.canceled &&
    (result.assets[0].type === "image" ||
      (videosAllowed && result.assets[0].type === "video"))
  ) {
    return { uri: result.assets[0].uri, type: result.assets[0].type };
  }
  return null;
}
