import { MessageType } from "@/types/MessageType";

export interface Message {
  is_read: boolean;
  message_content: string;
  message_id: string;
  message_type: MessageType;
  sender_id: string;
  sender_name?: string;
  sent_at: string;
}
