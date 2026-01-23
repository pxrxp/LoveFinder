export class MessageDto {
  message_id!: string;
  sender_id!: string;
  message_content!: string;
  is_read!: boolean;
  sent_at!: Date;
}
