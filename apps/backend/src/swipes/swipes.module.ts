import { Module, forwardRef } from '@nestjs/common';
import { SwipesController } from './swipes.controller';
import { SwipesService } from './swipes.service';
import { LiveChatModule } from '../live-chat/live-chat.module';

@Module({
  imports: [forwardRef(() => LiveChatModule)],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService],
})
export class SwipesModule {}
