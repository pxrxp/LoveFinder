import { Injectable } from '@nestjs/common';

@Injectable()
export class SwipesService {
  async swipe(
    swiper_id: string,
    receiver_id: string,
    type: 'like' | 'dislike',
  ) {
    return (
      await Bun.sql`
        insert into swipes (swiper_id, receiver_id, swipe_type)
        values (${swiper_id}, ${receiver_id}, ${type}::t_swipe_type)
        on conflict (swiper_id, receiver_id)
        do update set swipe_type = excluded.swipe_type
        returning *
      `
    )[0];
  }

  async remove(swiper_id: string, receiver_id: string) {
    await Bun.sql`
      delete from swipes
      where swiper_id = ${swiper_id}
        and receiver_id = ${receiver_id}
    `;
  }

  async findByUser(user_id: string) {
    return Bun.sql`
      select *
      from swipes
      where swiper_id = ${user_id}
    `;
  }

  async getSwipeStatus(userId: string, otherUserId: string) {
    const [result] = await Bun.sql`
      select
        exists(
          select 1 from swipes
          where swiper_id = ${userId} and receiver_id = ${otherUserId}
        ) as you_swiped,
        exists(
          select 1 from swipes
          where swiper_id = ${otherUserId} and receiver_id = ${userId}
        ) as they_swiped
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
