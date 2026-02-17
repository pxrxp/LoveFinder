export interface Message {
  is_read: boolean;
  message_content: string;
  message_id: string;
  message_type: "text" | "image";
  sender_id: string;
  sent_at: string;
}

export interface User {
  user_id: string;
  full_name: string;
  age: number;
  sexual_orientation: string;
  bio: string;
  profile_picture_url: string | null;
  allow_messages_from_strangers: boolean;
  swipe_category: "you" | "them" | "both" | "none";
}
