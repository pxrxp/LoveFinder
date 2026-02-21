import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  async validateUser(email: string, plain_password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, { unsafe: true });

    if (!user) return null;

    const hash = user.password_hash || user.PASSWORD_HASH;
    if (!hash) return null;

    const isMatch = await argon2.verify(hash, plain_password);

    if (isMatch) {
      const { password_hash, PASSWORD_HASH, ...stripped_user } = user;
      return stripped_user;
    }

    return null;
  }
  async validateResetToken(token: string) {
    const result = await Bun.sql`
      SELECT U.* 
      FROM USERS U
      JOIN USER_CREDENTIALS C ON U.USER_ID = C.USER_ID
      WHERE C.RESET_TOKEN = ${token} 
        AND C.RESET_EXPIRES > NOW()
    `;
    return result[0];
  }

  async findByGoogleId(googleId: string) {
    const result = await Bun.sql`
      SELECT U.* 
      FROM USERS U
      JOIN USER_OAUTH O ON U.USER_ID = O.USER_ID
      WHERE O.PROVIDER = 'google' AND O.PROVIDER_USER_ID = ${googleId}
    `;
    return result[0];
  }
}
