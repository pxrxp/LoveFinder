import { Injectable } from '@nestjs/common';

@Injectable()
export class BlocksService {

  async block(blocker_id: string, blocked_id: string) {
    return (
      await Bun.sql`
        INSERT INTO BLOCKS (BLOCKER_ID, BLOCKED_ID)
        VALUES (${blocker_id}, ${blocked_id})
        ON CONFLICT DO NOTHING
        RETURNING *
      `
    )[0];
  }

  async unblock(blocker_id: string, blocked_id: string) {
    await Bun.sql`
      DELETE FROM BLOCKS
      WHERE BLOCKER_ID = ${blocker_id}
        AND BLOCKED_ID = ${blocked_id}
    `;
  }

  async findBlockedUsers(user_id: string) {
    return Bun.sql`
      SELECT *
      FROM BLOCKS
      WHERE BLOCKER_ID = ${user_id}
    `;
  }
}
