import { Injectable } from '@nestjs/common';
import { ConversationDto } from './dto/conversation.dto';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
	async getConversations(user_id: string, limit: number, offset: number) : Promise<ConversationDto[]> {
		return Array.from(
			await Bun.sql`

				SELECT DISTINCT
						ON (M.RECEIVER_ID) M.SENT_AT,
						M.RECEIVER_ID,
						U.FULL_NAME,
						P.IMAGE_URL AS PROFILE_PICTURE_URL
				FROM
						MESSAGES M
						INNER JOIN USERS U ON U.USER_ID = M.RECEIVER_ID
						INNER JOIN PHOTOS P ON P.UPLOADER_ID = M.RECEIVER_ID
				WHERE
						M.SENDER_ID = ${user_id} AND P.IS_PRIMARY = TRUE
				ORDER BY
						M.RECEIVER_ID,
						M.SENT_AT DESC
				OFFSET
						${offset}
				LIMIT
						${limit}

		`);
	}

	async getMessages(user_id: string, other_user_id: string, limit: number, offset: number) : Promise<MessageDto[]> {
		return Array.from(
			await Bun.sql`

				SELECT
				    MESSAGE_ID,
				    SENDER_ID,
				    MSG_CONTENT,
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
