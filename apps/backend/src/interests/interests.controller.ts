import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post(':interest_id')
  add(
    @GetUser() user: UserDto,
    @Param('interest_id') interest_id: number
  ) {
    return this.interestsService.addInterestToUser(
      user.user_id,
      Number(interest_id)
    );
  }

  @Delete(':interest_id')
  remove(
    @GetUser() user: UserDto,
    @Param('interest_id') interest_id: number
  ) {
    return this.interestsService.removeInterestFromUser(
      user.user_id,
      Number(interest_id)
    );
  }

  @Get('me')
  getMine(@GetUser() user: UserDto) {
    return this.interestsService.getUserInterests(user.user_id);
  }
}
