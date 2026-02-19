import { apiFetch } from "@/services/api";

export async function uploadChatMedia(media: {
  uri: string;
  type: string;
}) {
  const uriParts = media.uri.split(".");
  const fileType = uriParts[uriParts.length - 1];

  const formData = new FormData();

  formData.append("file", {
    uri: media.uri,
    name: `file.${fileType}`,
    type: `${media.type}/${fileType}`,
  } as any);

  const res = await apiFetch(
    "chat-media/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  return res.json();
}
