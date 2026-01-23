import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { FeedModule } from './feed/feed.module';
import { LiveChatModule } from './live-chat/live-chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ChatModule, FeedModule, LiveChatModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticatedGuard,
    },
  ]
})
export class AppModule {}
