import { Module } from '@nestjs/common';
import { ChatMediaController } from './chat_media.controller';

@Module({
  controllers: [ChatMediaController]
})
export class ChatMediaModule {}
