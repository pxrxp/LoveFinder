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
      ),

      last_messages AS (
        SELECT DISTINCT ON (OTHER_USER_ID)
          OTHER_USER_ID,
          MESSAGE_ID,
          MESSAGE_CONTENT,
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
        LM.SENDER_ID AS LAST_MESSAGE_SENDER_ID,
        LM.SENT_AT AS LAST_MESSAGE_SENT_AT
      FROM last_messages LM
      JOIN USERS U ON U.USER_ID = LM.OTHER_USER_ID
      JOIN PHOTOS P ON P.UPLOADER_ID = LM.OTHER_USER_ID AND P.IS_PRIMARY = TRUE
      ORDER BY LM.SENT_AT DESC
      OFFSET ${offset}
      LIMIT ${limit}

    `
		);
	}

	async getMessages(user_id: string, other_user_id: string, limit: number, offset: number): Promise<MessageDto[]> {
		return Array.from(
			await Bun.sql`

				SELECT
				    MESSAGE_ID,
				    SENDER_ID,
				    MESSAGE_CONTENT,
				    IS_READ,
				    SENT_AT
				FROM MESSAGES
				WHERE (SENDER_ID = ${user_id} AND RECEIVER_ID = ${other_user_id})
				   OR (SENDER_ID = ${other_user_id} AND RECEIVER_ID = ${user_id})
				ORDER BY
						SENT_AT DESC
				OFFSET
						${offset}
				LIMIT
						${limit}

		`);
	}
}
