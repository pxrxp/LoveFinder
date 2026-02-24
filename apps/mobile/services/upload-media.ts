import { apiFetch } from "@/services/api";

export async function uploadFile(
  media: { uri: string; type: string },
  endpoint: string,
  extraFields?: Record<string, any>,
) {
  const uriParts = media.uri.split(".");
  const fileType = uriParts[uriParts.length - 1];

  const formData = new FormData();
  const finalType = media.type.includes("/")
    ? media.type
    : `${media.type}/${fileType}`;

  formData.append("file", {
    uri: media.uri,
    name: `file.${fileType}`,
    type: finalType,
  } as any);

  if (extraFields) {
    Object.entries(extraFields).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
  }

  const res = await apiFetch(endpoint, {
    method: "POST",
    body: formData,
  });

  return res.json();
}
