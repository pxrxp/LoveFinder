import { apiFetch } from "@/services/api";

export const getMyInterests = async () => {
  return await apiFetch(`interests/me`);
};

export const getAllApprovedInterests = async () => {
  return await apiFetch(`interests`);
};

export const addInterest = async (interestId: number) => {
  return await apiFetch(`interests/${interestId}`, { method: "POST" });
};

export const removeInterest = async (interestId: number) => {
  return await apiFetch(`interests/${interestId}`, { method: "DELETE" });
};

export const requestNewInterest = async (interestName: string) => {
  return await apiFetch(`interests/request`, {
    method: "POST",
    body: JSON.stringify({ interest_name: interestName }),
  });
};
