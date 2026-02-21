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
        INSERT INTO USERS (
          EMAIL,
          PASSWORD_HASH
        )
        VALUES (
          ${data.email},
          ${await argon2.hash(data.password)}
        )
        RETURNING *
      `
    )[0];
  }

  async findByEmail(
    email: string,
    options: { unsafe?: boolean; private?: boolean } = { unsafe: false, private: false }
  ): Promise<any | null> {
    const table = options.unsafe
      ? 'users'
      : options.private
        ? 'safe_users_personal'
        : 'safe_users_public';

    const result = await Bun.sql`
    SELECT
      U.*,
      U.password_hash as password_hash,
      P.IMAGE_URL AS PROFILE_PICTURE_URL
    FROM ${Bun.sql(table)} U
    LEFT JOIN PHOTOS P
      ON P.UPLOADER_ID = U.USER_ID
     AND P.IS_PRIMARY = TRUE
    WHERE U.EMAIL = ${email}
  `;

    return result[0] ?? null;
  }

  async findById(
    user_id: string,
    options: { unsafe?: boolean; private?: boolean } = { unsafe: false, private: false }
  ): Promise<UserDto | null> {
    const table = options.unsafe
      ? 'users'
      : options.private
        ? 'safe_users_personal'
        : 'safe_users_public';

    const result = await Bun.sql`
      SELECT
        U.*,
        P.IMAGE_URL AS PROFILE_PICTURE_URL
      FROM ${Bun.sql(table)} U
      LEFT JOIN PHOTOS P
        ON P.UPLOADER_ID = U.USER_ID
       AND P.IS_PRIMARY = TRUE
      WHERE U.USER_ID = ${user_id}
    `;

    return result[0] ?? null;
  }

  async update(user_id: string, data: UpdateUserDto): Promise<UserDto | null> {
    let pgPrefGenders = null;
    if (data.pref_genders) {
      const arr = Array.isArray(data.pref_genders) ? data.pref_genders : [data.pref_genders];
      pgPrefGenders = `{${arr.join(',')}}`;
    }

    const result = await Bun.sql`
      UPDATE USERS
      SET
        FULL_NAME = COALESCE(${data.full_name}, FULL_NAME),
        BIO = COALESCE(${data.bio}, BIO),
        BIRTH_DATE = COALESCE(${data.birth_date}::DATE, BIRTH_DATE),
        GENDER = COALESCE(${data.gender}::T_GENDER, GENDER),
        SEXUAL_ORIENTATION = COALESCE(${data.sexual_orientation}::T_ORIENTATION, SEXUAL_ORIENTATION),
        PREF_GENDERS = COALESCE(${pgPrefGenders}::T_GENDER[], PREF_GENDERS),
        LATITUDE = COALESCE(${data.latitude}, LATITUDE),
        LONGITUDE = COALESCE(${data.longitude}, LONGITUDE),
        IS_ONBOARDED = COALESCE(${data.is_onboarded}, IS_ONBOARDED)
      WHERE USER_ID = ${user_id}
      RETURNING *
    `;

    return result[0] ?? null;
  }

  async deactivate(user_id: string): Promise<void> {
    await Bun.sql`
      UPDATE USERS
      SET IS_ACTIVE = FALSE
      WHERE USER_ID = ${user_id}
    `;
  }
}
