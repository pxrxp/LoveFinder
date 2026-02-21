import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Image } from "expo-image";

export default function ProfilePicture({
  url,
  size,
  color = "black",
}: {
  url: string | null | undefined;
  size: number;
  color?: string;
}) {
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  } else {
    return <FontAwesome5 name="user-circle" size={size} color={color} />;
  }
}
