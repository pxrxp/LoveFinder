import { apiFetch } from "@/services/api";

export const fetchConversations = async (totalOffset: number, limit = 20) => {
  return await apiFetch(`chat?limit=${limit}&offset=${totalOffset}`);
};

export const fetchChatMessages = async (id: string, cursor?: string, limit = 20) => {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}&limit=${limit}` : `?limit=${limit}`;
  return await apiFetch(`chat/${id}${query}`);
};
