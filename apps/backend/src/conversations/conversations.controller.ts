import { Controller, Get, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationDto } from '../chat/dto/conversation.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';
import { OffsetPaginationPipe } from '../common/pipes/offset-pagination.pipe';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get('both')
  async getConversationsBoth(
    @GetUser() user: UserDto,
    @Query(OffsetPaginationPipe) pagination: { limit: number; offset: number },
  ): Promise<ConversationDto[]> {
    return this.conversationsService.getConversationsBoth(
      user.user_id,
      pagination.limit,
      pagination.offset,
    );
  }

  @Get('you')
  async getConversationsYou(
    @GetUser() user: UserDto,
    @Query(OffsetPaginationPipe) pagination: { limit: number; offset: number },
  ): Promise<ConversationDto[]> {
    return this.conversationsService.getConversationsYou(
      user.user_id,
      pagination.limit,
      pagination.offset,
    );
  }

  @Get('they')
  async getConversationsThey(
    @GetUser() user: UserDto,
    @Query(OffsetPaginationPipe) pagination: { limit: number; offset: number },
  ): Promise<ConversationDto[]> {
    return this.conversationsService.getConversationsThey(
      user.user_id,
      pagination.limit,
      pagination.offset,
    );
  }
}
