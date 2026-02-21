import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SwipesService } from '../swipes/swipes.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SwipesService],
  exports: [UsersService],
})
export class UsersModule {}
