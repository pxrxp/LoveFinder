import { Controller, Get, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { UsersService } from '../../users/users.service';

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return Bun.sql`SELECT * FROM USERS ORDER BY created_at DESC`;
  }

  @Get(':user_id')
  get(@Param('user_id', ParseUUIDPipe) user_id: string) {
    return this.usersService.findById(user_id, { private: true });
  }

  @Patch(':user_id/deactivate')
  deactivate(@Param('user_id', ParseUUIDPipe) user_id: string) {
    return this.usersService.deactivate(user_id);
  }
}
