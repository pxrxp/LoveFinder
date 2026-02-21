import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  serializeUser(user: UserDto, done: (err: any, id?: any) => void) {
    done(null, user.user_id);
  }

  async deserializeUser(
    userId: string,
    done: (err: any, user?: UserDto | null) => void,
  ) {
    const user = await this.usersService.findById(userId, { private: true });
    done(null, user || null);
  }
}
