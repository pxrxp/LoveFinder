import { apiFetch } from "@/services/api";

export const setPrimaryPhoto = async (photoId: string) => {
  return await apiFetch(`photos/${photoId}/primary`, { method: "POST" });
};

export const deletePhoto = async (photoId: string) => {
  return await apiFetch(`photos/${photoId}`, { method: "DELETE" });
};

export const getMyPhotos = async () => {
  return await apiFetch(`photos/me`);
};

export const getUserPhotos = async (userId: string) => {
  return await apiFetch(`photos/${userId}`);
};
