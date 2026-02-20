import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';
import { CursorPaginationPipe } from '../common/pipes/cursor-pagination.pipe';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':receiver_id')
  async getMessages(
    @GetUser() sender: UserDto,
    @Param('receiver_id', ParseUUIDPipe) receiver_id: string,
    @Query(CursorPaginationPipe) pagination: { limit: number; cursor: string },
  ): Promise<MessageDto[]> {
    return this.chatService.getMessages(
      sender.user_id,
      receiver_id,
      pagination.cursor,
      pagination.limit,
    );
  }
}
