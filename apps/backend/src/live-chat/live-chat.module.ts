import { Module } from '@nestjs/common';
import { LiveChatGateway } from './live-chat.gateway';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [LiveChatGateway, ChatService, UsersService],
})
export class LiveChatModule {}
