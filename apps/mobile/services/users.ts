import { apiFetch } from "@/services/api";
import { UserPrivate } from "@/types/User";

export const updateProfile = async (data: UserPrivate) => {
  return await apiFetch(`users`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deactivateProfile = async () => {
  return await apiFetch(`users`, { method: "DELETE" });
};

export const getMyProfile = async () => {
  return await apiFetch(`users/me`);
};

export const getUserProfile = async (userId: string) => {
  return await apiFetch(`users/${userId}`);
};
