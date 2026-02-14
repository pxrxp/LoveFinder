import { Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get('me')
  findBlocked(@GetUser() user: UserDto) {
    return this.blocksService.findBlockedUsers(user.user_id);
  }

  @Post(':blocked_id')
  block(
    @GetUser() user: UserDto,
    @Param('blocked_id', ParseUUIDPipe) blocked_id: string
  ) {
    return this.blocksService.block(user.user_id, blocked_id);
  }

  @Delete(':blocked_id')
  unblock(
    @GetUser() user: UserDto,
    @Param('blocked_id', ParseUUIDPipe) blocked_id: string
  ) {
    return this.blocksService.unblock(user.user_id, blocked_id);
  }
}
