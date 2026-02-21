import { Module, forwardRef } from '@nestjs/common';
import { LiveChatGateway } from './live-chat.gateway';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ChatModule, forwardRef(() => UsersModule)],
  providers: [LiveChatGateway],
  exports: [LiveChatGateway],
})
export class LiveChatModule { }
