import { Injectable } from '@nestjs/common';

@Injectable()
export class SwipesService {

  async swipe(swiper_id: string, receiver_id: string, type: 'like' | 'dislike') {
    return (
      await Bun.sql`
        INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE)
        VALUES (${swiper_id}, ${receiver_id}, ${type}::T_SWIPE_TYPE)
        ON CONFLICT (SWIPER_ID, RECEIVER_ID)
        DO UPDATE SET SWIPE_TYPE = EXCLUDED.SWIPE_TYPE
        RETURNING *
      `
    )[0];
  }

  async remove(swiper_id: string, receiver_id: string) {
    await Bun.sql`
      DELETE FROM SWIPES
      WHERE SWIPER_ID = ${swiper_id}
        AND RECEIVER_ID = ${receiver_id}
    `;
  }

  async findByUser(user_id: string) {
    return Bun.sql`
      SELECT *
      FROM SWIPES
      WHERE SWIPER_ID = ${user_id}
    `;
  }

  async getSwipeStatus(userId: string, otherUserId: string) {
    const [result] = await Bun.sql`
      SELECT
        EXISTS(
          SELECT 1 FROM SWIPES
          WHERE SWIPER_ID = ${userId} AND RECEIVER_ID = ${otherUserId}
        ) AS you_swiped,
        EXISTS(
          SELECT 1 FROM SWIPES
          WHERE SWIPER_ID = ${otherUserId} AND RECEIVER_ID = ${userId}
        ) AS they_swiped
    `;

    if (!result) return { status: 'none' };

    const { you_swiped, they_swiped } = result as {
      you_swiped: boolean;
      they_swiped: boolean;
    };

    if (you_swiped && they_swiped) return { status: 'both' };
    if (you_swiped && !they_swiped) return { status: 'you' };
    if (!you_swiped && they_swiped) return { status: 'they' };
    return { status: 'none' };
  }
}
