/**
 * Root module for the whole app.
 *
 * This file lists all the parts of the app (like Chat, Feed, and Auth) so
 * NestJS knows how to load them. It also sets up global rules like
 * requiring a login for every page by default.
 */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { FeedModule } from './feed/feed.module';
import { LiveChatModule } from './live-chat/live-chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PhotosModule } from './photos/photos.module';
import { SwipesModule } from './swipes/swipes.module';
import { BlocksModule } from './blocks/blocks.module';
import { ReportsModule } from './reports/reports.module';
import { InterestsModule } from './interests/interests.module';
import { ChatMediaModule } from './chat-media/chat-media.module';
import { AdminModule } from './admin/admin.module';
import { join } from 'path';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [
    ChatModule,
    FeedModule,
    LiveChatModule,
    AuthModule,
    UsersModule,
    PhotosModule,
    SwipesModule,
    BlocksModule,
    ReportsModule,
    InterestsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/static',
    }),
    ChatMediaModule,
    AdminModule,
    ConversationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticatedGuard,
    },
  ],
})
export class AppModule {}
