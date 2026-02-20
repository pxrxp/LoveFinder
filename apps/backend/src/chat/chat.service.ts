import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  async getMessages(
    userId: string,
    otherUserId: string,
    cursor: string | null,
    limit: number
  ): Promise<MessageDto[]> {
    return Array.from(await Bun.sql`
      SELECT MESSAGE_ID, SENDER_ID, RECEIVER_ID, MESSAGE_TYPE, MESSAGE_CONTENT, IS_READ, SENT_AT 
      FROM MESSAGES 
      WHERE ( 
        ( SENDER_ID = ${userId} AND RECEIVER_ID = ${otherUserId} ) 
        OR ( SENDER_ID = ${otherUserId} AND RECEIVER_ID = ${userId} ) 
      ) AND IS_DELETED = FALSE 
      AND ( ${cursor}::timestamptz IS NULL OR SENT_AT < ${cursor} ) 
      ORDER BY SENT_AT DESC 
      LIMIT ${limit}
    `);
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: 'text' | 'image' = 'text'
  ) {
    const [msg] = await Bun.sql`
      WITH inserted AS (
        INSERT INTO messages (sender_id, receiver_id, message_type, message_content)
        VALUES (${senderId}, ${receiverId}, ${type}, ${content})
        RETURNING *
      )
      SELECT i.*, u.full_name AS sender_name FROM inserted i JOIN users u ON u.user_id = i.sender_id
    `;
    return msg;
  }

  async markAsRead(user_id: string, other_user_id: string): Promise<void> {
    await Bun.sql`
      UPDATE MESSAGES SET IS_READ = TRUE 
      WHERE RECEIVER_ID = ${user_id} AND SENDER_ID = ${other_user_id}
    `;
  }

  async deleteMessage(userId: string, messageId: string) {
    const result = await Bun.sql`
      UPDATE messages SET is_deleted = TRUE 
      WHERE message_id = ${messageId} AND sender_id = ${userId} RETURNING message_id
    `;
    if (result.length === 0) {
      throw new Error('Message not found or unauthorized');
    }
    return result[0];
  }

  getRoomId(user1: string, user2: string) {
    return [user1, user2].sort().join('_');
  }
}
