import { Module } from '@nestjs/common';
import { LiveChatService } from './live-chat.service';
import { LiveChatGateway } from './live-chat.gateway';

@Module({
  providers: [LiveChatGateway, LiveChatService],
})
export class LiveChatModule {}
