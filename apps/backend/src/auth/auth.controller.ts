import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDto } from '../users/dto/user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@GetUser() user: UserDto) {
    return user;
  }

  @Post('logout')
  logout(@Req() request: any) {
    request.logout(() => { });
    request.session.destroy(() => { });
    return { message: 'Logged out' };
  }
}
