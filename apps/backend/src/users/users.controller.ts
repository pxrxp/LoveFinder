import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@GetUser() user:UserDto) {
    return user;
  }

  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) user_id: string) : Promise<UserDto>{
    return this.usersService.findById(user_id);
  }
}
