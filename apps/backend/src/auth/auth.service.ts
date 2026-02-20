import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, plain_password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, {unsafe: true});

    if (!user) {
      return null;
    }

    const isMatch = await argon2.verify(user.password_hash, plain_password);
    
    if (isMatch) {
  		const {password_hash, ...stripped_user} = user;
  		return stripped_user;
    }
    
    return null;
  }
}
