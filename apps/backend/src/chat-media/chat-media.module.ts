import { Module } from '@nestjs/common';
import { ChatMediaController } from './chat-media.controller';

@Module({
  controllers: [ChatMediaController],
})
export class ChatMediaModule {}
