import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [ChatModule, FeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
