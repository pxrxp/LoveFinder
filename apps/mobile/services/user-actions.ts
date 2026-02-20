import { apiFetch } from "@/services/api";

export enum ReportReason {
  SPAM = "spam",
  HARASSMENT = "harassment",
  FAKE_PROFILE = "fake_profile",
  INAPPROPRIATE_CONTENT = "inappropriate_content",
  SCAM = "scam",
  IMPERSONATION = "impersonation",
  HATE_SPEECH = "hate_speech",
  DISCRIMINATION = "discrimination",
  THREATS = "threats",
  VIOLENCE = "violence",
  NUDITY = "nudity",
  SELF_HARM = "self_harm",
  UNDERAGE_USER = "underage_user",
  BULLYING = "bullying",
  MISLEADING_INFORMATION = "misleading_information",
  OFFENSIVE_LANGUAGE = "offensive_language",
  OTHER = "other",
}

export const swipeUser = async (targetId: string, type: "like" | "dislike") => {
  return await apiFetch(`swipes/${targetId}/${type}`, {
    method: "POST",
  });
};

export const unswipeUser = async (targetId: string) => {
  return await apiFetch(`swipes/${targetId}`, {
    method: "DELETE",
  });
};

export const blockUser = async (targetId: string) => {
  return await apiFetch(`blocks/${targetId}`, {
    method: "POST",
  });
};

export const reportUser = async (
  targetId: string,
  reason: ReportReason,
  details: string
) => {
  return await apiFetch(`reports/${targetId}`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
  });
};
