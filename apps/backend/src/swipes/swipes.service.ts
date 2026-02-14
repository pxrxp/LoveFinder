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
}
