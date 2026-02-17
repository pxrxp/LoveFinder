import { Injectable } from '@nestjs/common';
import { ConversationDto } from './dto/conversation.dto';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
	async getConversations(
		user_id: string,
		limit: number,
		offset: number
	): Promise<ConversationDto[]> {
		return Array.from(
			await Bun.sql`

      WITH user_messages AS (
        SELECT
          MESSAGE_ID,
          MESSAGE_CONTENT,
          MESSAGE_TYPE,
          SENT_AT,
          SENDER_ID,
          RECEIVER_ID,
          CASE
            WHEN SENDER_ID = ${user_id} THEN RECEIVER_ID
            ELSE SENDER_ID
          END AS OTHER_USER_ID
        FROM MESSAGES
        WHERE SENDER_ID = ${user_id} OR RECEIVER_ID = ${user_id}
      ),

      last_messages AS (
        SELECT DISTINCT ON (OTHER_USER_ID)
          OTHER_USER_ID,
          MESSAGE_ID,
          MESSAGE_CONTENT,
          MESSAGE_TYPE,
          SENT_AT,
          SENDER_ID
        FROM user_messages
        ORDER BY OTHER_USER_ID, SENT_AT DESC
      )

      SELECT
        LM.OTHER_USER_ID,
        U.FULL_NAME,
        P.IMAGE_URL AS PROFILE_PICTURE_URL,
        LM.MESSAGE_CONTENT AS LAST_MESSAGE,
        LM.MESSAGE_TYPE AS LAST_MESSAGE_TYPE,
        LM.SENDER_ID AS LAST_MESSAGE_SENDER_ID,
        LM.SENT_AT AS LAST_MESSAGE_SENT_AT,
        CASE
          WHEN S1.SWIPE_TYPE IS NOT NULL AND S2.SWIPE_TYPE IS NOT NULL THEN 'both'
          WHEN S1.SWIPE_TYPE IS NOT NULL AND S2.SWIPE_TYPE IS NULL THEN 'you'
          WHEN S1.SWIPE_TYPE IS NULL AND S2.SWIPE_TYPE IS NOT NULL THEN 'they'
          ELSE 'none'
        END AS swipe_category
      FROM last_messages LM
      JOIN USERS U ON U.USER_ID = LM.OTHER_USER_ID
      JOIN PHOTOS P ON P.UPLOADER_ID = LM.OTHER_USER_ID AND P.IS_PRIMARY = TRUE
      LEFT JOIN SWIPES S1 ON S1.SWIPER_ID = ${user_id} AND S1.RECEIVER_ID = LM.OTHER_USER_ID
      LEFT JOIN SWIPES S2 ON S2.SWIPER_ID = LM.OTHER_USER_ID AND S2.RECEIVER_ID = ${user_id}
      ORDER BY LM.SENT_AT DESC
      OFFSET ${offset}
      LIMIT ${limit}

    `
		);
	}

	async getMessages(
		userId: string,
		otherUserId: string,
		cursor: string | null,
		limit: number
	): Promise<MessageDto[]> {

		return Array.from(await Bun.sql`
	    SELECT
	      MESSAGE_ID,
	      SENDER_ID,
	      RECEIVER_ID,
	      MESSAGE_TYPE,
	      MESSAGE_CONTENT,
	      IS_READ,
	      SENT_AT
	    FROM MESSAGES
	    WHERE (
	      (
	        SENDER_ID = ${userId}
	        AND RECEIVER_ID = ${otherUserId}
	      )
	      OR
	      (
	        SENDER_ID = ${otherUserId}
	        AND RECEIVER_ID = ${userId}
	      )
	    )
	    AND IS_DELETED = FALSE
	    AND (
	      ${cursor}::timestamptz IS NULL
	      OR SENT_AT < ${cursor}
	    )
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
	    INSERT INTO MESSAGES (
	      SENDER_ID,
	      RECEIVER_ID,
	      MESSAGE_TYPE,
	      MESSAGE_CONTENT
	    )
	    VALUES (
	      ${senderId},
	      ${receiverId},
	      ${type},
	      ${content}
	    )
	    RETURNING *
	  `;

		return msg;
	}

	async markAsRead(user_id: string, other_user_id: string): Promise<void> {
		await Bun.sql`
      UPDATE MESSAGES
      SET IS_READ = TRUE
      WHERE RECEIVER_ID = ${user_id} AND SENDER_ID = ${other_user_id}
    `;
	}

	async deleteMessage(userId: string, messageId: string) {
		const result = await Bun.sql`
	    UPDATE messages
	    SET is_deleted = TRUE
	    WHERE message_id = ${messageId}
	      AND sender_id = ${userId}
	    RETURNING message_id
	  `;

		if (result.length === 0) {
			throw new Error("Message not found or unauthorized");
		}

		return result[0];
	}

	getRoomId(user1: string, user2: string) {
		return [user1, user2].sort().join('_');
	}
}
