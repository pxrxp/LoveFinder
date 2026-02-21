/**
 * Network requests for user profiles.
 *
 * Includes creating accounts, fetching your own profile,
 * and updating your info.
 */
import { apiFetch } from "@/services/api";
import { UserPrivate } from "@/types/User";

export const createUser = async (email: string, password: string) => {
  return await apiFetch(`users`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

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
