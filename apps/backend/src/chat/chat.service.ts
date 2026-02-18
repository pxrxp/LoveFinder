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

      WITH conversation_users AS (

        SELECT
          CASE
            WHEN SENDER_ID = ${user_id} THEN RECEIVER_ID
            ELSE SENDER_ID
          END AS OTHER_USER_ID
        FROM MESSAGES
        WHERE SENDER_ID = ${user_id}
           OR RECEIVER_ID = ${user_id}

        UNION

        SELECT RECEIVER_ID AS OTHER_USER_ID
        FROM SWIPES
        WHERE SWIPER_ID = ${user_id}

        UNION

        SELECT SWIPER_ID AS OTHER_USER_ID
        FROM SWIPES
        WHERE RECEIVER_ID = ${user_id}

      ),

      last_messages AS (
        SELECT DISTINCT ON (OTHER_USER_ID)
          OTHER_USER_ID,
          MESSAGE_ID,
          MESSAGE_CONTENT,
          MESSAGE_TYPE,
          SENT_AT,
          SENDER_ID
        FROM (
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
          WHERE SENDER_ID = ${user_id}
             OR RECEIVER_ID = ${user_id}
        ) t
        ORDER BY OTHER_USER_ID, SENT_AT DESC
      )

      SELECT
        CU.OTHER_USER_ID,
        U.FULL_NAME,
        P.IMAGE_URL AS PROFILE_PICTURE_URL,

        LM.MESSAGE_CONTENT AS LAST_MESSAGE,
        LM.MESSAGE_TYPE AS LAST_MESSAGE_TYPE,
        LM.SENDER_ID AS LAST_MESSAGE_SENDER_ID,

        CASE
          WHEN S1.SWIPE_TYPE = 'like' AND S2.SWIPE_TYPE = 'like' THEN 'both'
          WHEN S1.SWIPE_TYPE = 'like' THEN 'you'
          WHEN S2.SWIPE_TYPE = 'like' THEN 'they'
          ELSE 'none'
        END AS swipe_category,

        COALESCE(S1.SWIPED_AT, S2.SWIPED_AT) AS LAST_MESSAGE_SENT_AT

      FROM conversation_users CU

      LEFT JOIN last_messages LM
        ON LM.OTHER_USER_ID = CU.OTHER_USER_ID

      LEFT JOIN SWIPES S1
        ON S1.SWIPER_ID = ${user_id}
       AND S1.RECEIVER_ID = CU.OTHER_USER_ID

      LEFT JOIN SWIPES S2
        ON S2.SWIPER_ID = CU.OTHER_USER_ID
       AND S2.RECEIVER_ID = ${user_id}

      LEFT JOIN BLOCKS B1
        ON B1.BLOCKER_ID = ${user_id} AND B1.BLOCKED_ID = CU.OTHER_USER_ID

      LEFT JOIN BLOCKS B2
        ON B2.BLOCKER_ID = CU.OTHER_USER_ID AND B2.BLOCKED_ID = ${user_id}

      JOIN USERS U
        ON U.USER_ID = CU.OTHER_USER_ID

      JOIN PHOTOS P
        ON P.UPLOADER_ID = CU.OTHER_USER_ID
       AND P.IS_PRIMARY = TRUE

      WHERE
        B1.BLOCKED_ID IS NULL
        AND B2.BLOCKED_ID IS NULL
        AND NOT (S1.SWIPE_TYPE = 'like' AND S2.SWIPE_TYPE IS NULL AND U.ALLOW_MESSAGES_FROM_STRANGERS = FALSE)

      ORDER BY COALESCE(LM.SENT_AT, S1.SWIPED_AT, S2.SWIPED_AT) DESC

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
    WITH inserted AS (
      INSERT INTO messages (
        sender_id,
        receiver_id,
        message_type,
        message_content
      ) VALUES (
        ${senderId},
        ${receiverId},
        ${type},
        ${content}
      )
      RETURNING *
    )
    SELECT i.*, u.full_name AS sender_name
    FROM inserted i
    JOIN users u ON u.user_id = i.sender_id
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
