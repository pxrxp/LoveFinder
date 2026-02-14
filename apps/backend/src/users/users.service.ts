import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  async create(data: CreateUserDto): Promise<UserDto> {

    return (
      await Bun.sql`
        INSERT INTO USERS (
          EMAIL,
          PASSWORD_HASH,
          FULL_NAME,
          GENDER,
          SEXUAL_ORIENTATION,
          BIRTH_DATE,
          PREF_GENDERS
        )
        VALUES (
          ${data.email},
          ${data.password_hash},
          ${data.full_name},
          ${data.gender}::T_GENDER,
          ${data.sexual_orientation}::T_ORIENTATION,
          ${data.birth_date},
          ARRAY[${data.gender}]::T_GENDER[]
        )
        RETURNING *
      `
    )[0];
  }

  async findByEmail(
    email: string,
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

  async update(
    user_id: string,
    data: UpdateUserDto
  ): Promise<UserDto | null> {

    const result = await Bun.sql`
      UPDATE USERS
      SET
        FULL_NAME = COALESCE(${data.full_name}, FULL_NAME),
        BIO = COALESCE(${data.bio}, BIO),
        PREF_GENDERS = COALESCE(${data.pref_genders}::T_GENDER[], PREF_GENDERS),
        PREF_MIN_AGE = COALESCE(${data.pref_min_age}, PREF_MIN_AGE),
        PREF_MAX_AGE = COALESCE(${data.pref_max_age}, PREF_MAX_AGE),
        PREF_DISTANCE_RADIUS_KM = COALESCE(${data.pref_distance_radius_km}, PREF_DISTANCE_RADIUS_KM),
        ALLOW_MESSAGES_FROM_STRANGERS = COALESCE(${data.allow_messages_from_strangers}, ALLOW_MESSAGES_FROM_STRANGERS)
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
