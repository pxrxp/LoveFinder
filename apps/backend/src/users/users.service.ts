import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
	async findByEmail(email: string, options: { unsafe?: boolean, private?: boolean } = { unsafe: false, private: false }): Promise<UserDto> {
		let database = options.unsafe ? 'users' : (
			options.private ? 'safe_users_personal' : 'safe_users_public'
		);

		return (
			await Bun.sql`

			  SELECT * FROM ${Bun.sql(database)} WHERE EMAIL=${email}

		`)[0];
	}

	async findById(user_id: string, options: { unsafe?: boolean, private?: boolean } = { unsafe: false, private: false }): Promise<UserDto> {
		let database = options.unsafe ? 'users' : (
			options.private ? 'safe_users_personal' : 'safe_users_public'
		);
		
		return (
			await Bun.sql`

			  SELECT * FROM ${Bun.sql(database)} WHERE USER_ID=${user_id}

		`)[0];
	}
}
