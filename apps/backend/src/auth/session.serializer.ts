import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  serializeUser(user: UserDto, done: Function) {
    done(null, user.user_id);
  }

  async deserializeUser(userId: string, done: Function) {
    const user = await this.usersService.findById(userId, { private: true });
    done(null, user || null);
  }
}
