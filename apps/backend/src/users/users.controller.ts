import { Controller, Get, Patch, Delete, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(dto);
  }

  @Get('me')
  async me(@GetUser() user: UserDto) {
    return user;
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto | null> {
    return this.usersService.findById(id);
  }

  @Patch()
  async update(@GetUser() user: UserDto, @Body() dto: UpdateUserDto): Promise<UserDto | null> {
    return this.usersService.update(user.user_id, dto);
  }

  @Delete()
  async deactivate(@GetUser() user: UserDto): Promise<void> {
    return this.usersService.deactivate(user.user_id);
  }
}
