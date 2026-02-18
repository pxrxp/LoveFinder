export interface Conversation {
  other_user_id: string;
  full_name: string;
  profile_picture_url: string;
  last_message: string;
  last_message_type: "text" | "image" | "audio" | "video";
  last_message_sender_id: string;
  last_message_sent_at: Date;
  swipe_category: "you" | "they" | "both" | "none";
}
