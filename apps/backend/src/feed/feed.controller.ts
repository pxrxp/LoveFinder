import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import { FeedDto } from './dto/feed.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getConversations(
    @GetUser() user: UserDto,
    @Query(PaginationPipe) pagination: { limit: number },
  ): Promise<FeedDto[]> {
    return this.feedService.getFeed(user.user_id, pagination.limit);
  }
}
