import { Controller, Get, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { OffsetPaginationPipe } from '../common/pipes/offset-pagination.pipe';
import { FeedDto } from './dto/feed.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeed(
    @GetUser() user: UserDto,
    @Query(OffsetPaginationPipe) pagination: { limit: number; offset?: number },
  ): Promise<FeedDto[]> {
    return this.feedService.getFeed(
      user.user_id,
      pagination.limit,
      pagination.offset,
    );
  }
}
