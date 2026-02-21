import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, plain_password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, { unsafe: true });

    if (!user) return null;

    const hash = user.password_hash;
    if (!hash) return null;

    const isMatch = await argon2.verify(hash, plain_password);

    if (isMatch) {
      const { password_hash, ...stripped_user } = user;
      return stripped_user;
    }

    return null;
  }

  async validateResetToken(token: string) {
    const result = await Bun.sql`
      select u.* 
      from users u
      join user_credentials c on u.user_id = c.user_id
      where c.reset_token = ${token} 
        and c.reset_expires > now()
    `;
    return result[0];
  }

  async findByGoogleId(googleId: string) {
    const result = await Bun.sql`
      select u.* 
      from users u
      join user_oauth o on u.user_id = o.user_id
      where o.provider = 'google' and o.provider_user_id = ${googleId}
    `;
    return result[0];
  }
}
