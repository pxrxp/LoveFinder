import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConversationDto } from './dto/conversation.dto';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import { MessageDto } from './dto/message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get(':user_id/conversations')
  async getConversations(
    @Param('user_id', ParseUUIDPipe) user_id: string,
    @Query(PaginationPipe) pagination: { limit: number; offset: number },
  ): Promise<ConversationDto[]> {
    return this.chatService.getConversations(user_id, pagination.limit, pagination.offset);
  }

  @Get(':sender_id/conversations/:receiver_id/messages')
  async getMessages(
    @Param('sender_id', ParseUUIDPipe) sender_id: string,
    @Param('receiver_id', ParseUUIDPipe) receiver_id: string,
    @Query(PaginationPipe) pagination: { limit: number; offset: number },
  ): Promise<MessageDto[]> {
    return this.chatService.getMessages(sender_id, receiver_id, pagination.limit, pagination.offset);
  }
}
