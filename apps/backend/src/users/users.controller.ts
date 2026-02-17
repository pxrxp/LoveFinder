import { Controller, Get, Patch, Delete, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SwipesService } from '../swipes/swipes.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly swipesService: SwipesService) { }

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
  async get(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() viewer: UserDto
  ): Promise<(UserDto & { swipe_category?: string }) | null> {
    const user = await this.usersService.findById(id);
    if (!user) return null;

    let swipe_category: string | undefined = undefined;
    if (viewer) {
      const status = await this.swipesService.getSwipeStatus(viewer.user_id, id);
      swipe_category = status.status;
    }

    return { ...user, swipe_category };
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
