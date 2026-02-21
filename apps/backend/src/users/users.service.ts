/**
 * Logic for handling user profiles and accounts.
 *
 * This file connects to the database to create users, update bios,
 * and fetch profiles. It uses "safe" database views to make sure
 * we don't accidentally send passwords or birthdays to other users.
 */
import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  async create(data: CreateUserDto): Promise<UserDto> {
    return (
      await Bun.sql`
        insert into users (
          email,
          password_hash
        )
        values (
          ${data.email},
          ${await argon2.hash(data.password)}
        )
        returning *
      `
    )[0];
  }

  async findByEmail(
    email: string,
    options: { unsafe?: boolean; private?: boolean } = {
      unsafe: false,
      private: false,
    },
  ): Promise<any | null> {
    const table = options.unsafe
      ? 'users'
      : options.private
        ? 'safe_users_personal'
        : 'safe_users_public';

    const result = await Bun.sql`
      select
        u.*,
        p.image_url as profile_picture_url
      from ${Bun.sql(table)} u
      left join photos p
        on p.uploader_id = u.user_id
       and p.is_primary = true
      where u.email = ${email}
    `;

    return result[0] ?? null;
  }

  async findById(
    user_id: string,
    options: { unsafe?: boolean; private?: boolean } = {
      unsafe: false,
      private: false,
    },
  ): Promise<UserDto | null> {
    const table = options.unsafe
      ? 'users'
      : options.private
        ? 'safe_users_personal'
        : 'safe_users_public';

    const result = await Bun.sql`
      select
        u.*,
        p.image_url as profile_picture_url
      from ${Bun.sql(table)} u
      left join photos p
        on p.uploader_id = u.user_id
       and p.is_primary = true
      where u.user_id = ${user_id}
    `;

    return result[0] ?? null;
  }

  async update(user_id: string, data: UpdateUserDto): Promise<UserDto | null> {
    let pgPrefGenders = null;
    if (data.pref_genders) {
      const arr = Array.isArray(data.pref_genders)
        ? data.pref_genders
        : [data.pref_genders];
      pgPrefGenders = `{${arr.join(',')}}`;
    }

    const result = await Bun.sql`
      update users
      set
        full_name = coalesce(${data.full_name}, full_name),
        bio = coalesce(${data.bio}, bio),
        birth_date = coalesce(${data.birth_date}::date, birth_date),
        gender = coalesce(${data.gender}::t_gender, gender),
        sexual_orientation = coalesce(${data.sexual_orientation}::t_orientation, sexual_orientation),
        pref_genders = coalesce(${pgPrefGenders}::t_gender[], pref_genders),
        latitude = coalesce(${data.latitude}, latitude),
        longitude = coalesce(${data.longitude}, longitude),
        is_onboarded = coalesce(${data.is_onboarded}, is_onboarded)
      where user_id = ${user_id}
      returning *
    `;

    return result[0] ?? null;
  }

  async deactivate(user_id: string): Promise<void> {
    await Bun.sql`
      update users
      set is_active = false
      where user_id = ${user_id}
    `;
  }
}
