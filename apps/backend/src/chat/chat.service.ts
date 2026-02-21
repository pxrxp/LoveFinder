import { ForbiddenException, Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  async getMessages(
    userId: string,
    otherUserId: string,
    cursor: string | null,
    limit: number,
  ): Promise<MessageDto[]> {
    return Array.from(
      await Bun.sql`
      select message_id, sender_id, receiver_id, message_type, message_content, is_read, sent_at 
      from messages 
      where ( 
        ( sender_id = ${userId} and receiver_id = ${otherUserId} ) 
        or ( sender_id = ${otherUserId} and receiver_id = ${userId} ) 
      ) and is_deleted = false 
      and ( ${cursor}::timestamptz is null or sent_at < ${cursor} ) 
      order by sent_at desc 
      limit ${limit}
    `,
    );
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: 'text' | 'image' = 'text',
  ) {
    try {
      const [msg] = await Bun.sql`
        with inserted as (
          insert into messages (sender_id, receiver_id, message_type, message_content)
          values (${senderId}, ${receiverId}, ${type}, ${content})
          returning *
        )
        select i.*, u.full_name as sender_name from inserted i join users u on u.user_id = i.sender_id
      `;
      return msg;
    } catch (err: any) {
      if (err.message?.includes('cannot message')) {
        throw new ForbiddenException(
          'You can only message people who have liked you back unless they allow messages from strangers.',
        );
      }
      throw err;
    }
  }

  async markAsRead(user_id: string, other_user_id: string): Promise<void> {
    await Bun.sql`
      update messages set is_read = true 
      where receiver_id = ${user_id} and sender_id = ${other_user_id}
    `;
  }

  async deleteMessage(userId: string, messageId: string) {
    const result = await Bun.sql`
      update messages set is_deleted = true 
      where message_id = ${messageId} and sender_id = ${userId} returning message_id
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
