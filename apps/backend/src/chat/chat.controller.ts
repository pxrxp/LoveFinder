import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConversationDto } from './dto/conversation.dto';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import { MessageDto } from './dto/message.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get()
  async getConversations(@GetUser() user: UserDto, @Query(PaginationPipe) pagination: { limit: number; offset: number }): Promise<ConversationDto[]> {
    return this.chatService.getConversations(user.user_id, pagination.limit, pagination.offset);
  }

  @Get(':receiver_id')
  async getMessages(
    @GetUser() sender: UserDto,
    @Param('receiver_id', ParseUUIDPipe) receiver_id: string,
    @Query(PaginationPipe) pagination: { limit: number; offset: number },
  ): Promise<MessageDto[]> {
    return this.chatService.getMessages(sender.user_id, receiver_id, pagination.limit, pagination.offset);
  }
}
