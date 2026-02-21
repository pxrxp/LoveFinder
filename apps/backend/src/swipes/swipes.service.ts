import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { LiveChatGateway } from '../live-chat/live-chat.gateway';

@Injectable()
export class SwipesService {
  constructor(
    @Inject(forwardRef(() => LiveChatGateway))
    private readonly liveChatGateway: LiveChatGateway,
  ) {}

  async swipe(
    swiper_id: string,
    receiver_id: string,
    type: 'like' | 'dislike',
  ) {
    if (swiper_id === receiver_id) {
      throw new BadRequestException('You cannot swipe on yourself.');
    }

    const swipeResult = (
      await Bun.sql`
        insert into swipes (swiper_id, receiver_id, swipe_type)
        values (${swiper_id}, ${receiver_id}, ${type}::t_swipe_type)
        on conflict (swiper_id, receiver_id)
        do update set swipe_type = excluded.swipe_type
        returning *
      `
    )[0];

    if (type === 'like') {
      const matchStatus = await this.getSwipeStatus(swiper_id, receiver_id);
      if (matchStatus.status === 'both') {
        // It's a match! Notify both users
        this.liveChatGateway.server
          .to(swiper_id)
          .emit('new_match', { other_user_id: receiver_id });
        this.liveChatGateway.server
          .to(receiver_id)
          .emit('new_match', { other_user_id: swiper_id });
      } else {
        // Notify the receiver that they were liked (for "They Liked" tab)
        this.liveChatGateway.server
          .to(receiver_id)
          .emit('new_like', { from_user_id: swiper_id });
      }
    }

    return swipeResult;
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
