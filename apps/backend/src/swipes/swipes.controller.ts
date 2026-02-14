import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';

@Controller('swipes')
export class SwipesController {
  constructor(private readonly swipesService: SwipesService) {}

  @Post(':receiverId/:type')
  swipe(
    @GetUser() user: UserDto,
    @Param('receiverId', ParseUUIDPipe) receiverId: string,
    @Param('type') type: 'like' | 'dislike'
  ) {
    return this.swipesService.swipe(user.user_id, receiverId, type);
  }

  @Delete(':receiver_id')
  remove(
    @GetUser() user: UserDto,
    @Param('receiver_id', ParseUUIDPipe) receiver_id: string
  ) {
    return this.swipesService.remove(user.user_id, receiver_id);
  }

  @Get('me')
  findMine(@GetUser() user: UserDto) {
    return this.swipesService.findByUser(user.user_id);
  }
}
