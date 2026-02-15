import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConversationDto } from './dto/conversation.dto';
import { MessageDto } from './dto/message.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';
import { OffsetPaginationPipe } from '../common/pipes/offset-pagination.pipe';
import { CursorPaginationPipe } from '../common/pipes/cursor-pagination.pipe';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get()
  async getConversations(@GetUser() user: UserDto, @Query(OffsetPaginationPipe) pagination: { limit: number; offset: number }): Promise<ConversationDto[]> {
    return this.chatService.getConversations(user.user_id, pagination.limit, pagination.offset);
  }

  @Get(':receiver_id')
  async getMessages(
    @GetUser() sender: UserDto,
    @Param('receiver_id', ParseUUIDPipe) receiver_id: string,
    @Query(CursorPaginationPipe) pagination: { limit: number; cursor: string },
  ): Promise<MessageDto[]> {
    return this.chatService.getMessages(sender.user_id, receiver_id, pagination.cursor, pagination.limit);
  }
}
