import { Image } from "react-native";

export default function ProfilePicture({
  url,
  size,
}: {
  url: string;
  size: number;
}) {
  return (
    <Image
      source={{ uri: url }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}
