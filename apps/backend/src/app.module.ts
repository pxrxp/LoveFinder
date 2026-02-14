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
import { PhotosModule } from './photos/photos.module';
import { SwipesModule } from './swipes/swipes.module';
import { BlocksModule } from './blocks/blocks.module';
import { ReportsModule } from './reports/reports.module';
import { InterestsModule } from './interests/interests.module';

@Module({
  imports: [ChatModule, FeedModule, LiveChatModule, AuthModule, UsersModule, PhotosModule, SwipesModule, BlocksModule, ReportsModule, InterestsModule],
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
