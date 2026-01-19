import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import { FeedDto } from './dto/feed.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get(':user_id')
  async getConversations(
    @Param('user_id', ParseUUIDPipe) user_id: string,
    @Query(PaginationPipe) pagination: { limit: number },
  ): Promise<FeedDto[]> {
    return this.feedService.getFeed(user_id, pagination.limit);
  }
}
