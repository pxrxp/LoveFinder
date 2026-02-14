import {Injectable} from '@nestjs/common';

@Injectable()
export class PhotosService {

  async create(user_id: string, image_url: string, is_primary = false) {
    if (is_primary) {
      await Bun.sql`
        UPDATE PHOTOS
        SET IS_PRIMARY = FALSE
        WHERE UPLOADER_ID = ${user_id}
      `;
    }

    return (
      await Bun.sql`
        INSERT INTO PHOTOS (UPLOADER_ID, IMAGE_URL, IS_PRIMARY)
        VALUES (${user_id}, ${image_url}, ${is_primary})
        RETURNING *
      `
    )[0];
  }

  async setPrimary(user_id: string, photo_id: string) {
    await Bun.sql`
      UPDATE PHOTOS
      SET IS_PRIMARY = FALSE
      WHERE UPLOADER_ID = ${user_id}
    `;

    return (
      await Bun.sql`
        UPDATE PHOTOS
        SET IS_PRIMARY = TRUE
        WHERE PHOTO_ID = ${photo_id}
          AND UPLOADER_ID = ${user_id}
        RETURNING *
      `
    )[0];
  }

  async findByUser(user_id: string) {
    return Bun.sql`
      SELECT *
      FROM PHOTOS
      WHERE UPLOADER_ID = ${user_id}
      ORDER BY IS_PRIMARY DESC
    `;
  }

  async delete(user_id: string, photo_id: string) {
    await Bun.sql`
      DELETE FROM PHOTOS
      WHERE PHOTO_ID = ${photo_id}
        AND UPLOADER_ID = ${user_id}
    `;
  }
}

