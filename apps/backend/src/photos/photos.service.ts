import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PhotosService {
  async create(
    userId: string,
    url: string,
    isPrimary: boolean,
    replacePhotoId?: string,
  ) {
    try {
      if (replacePhotoId) {
        await Bun.sql`
          DELETE FROM PHOTOS 
          WHERE PHOTO_ID = ${replacePhotoId} AND UPLOADER_ID = ${userId}
        `;
      }

      const result = await Bun.sql`
        INSERT INTO PHOTOS (UPLOADER_ID, IMAGE_URL, IS_PRIMARY)
        VALUES (${userId}, ${url}, FALSE)
        RETURNING *
      `;

      const newPhoto = result[0];

      if (isPrimary && !newPhoto.is_primary) {
        return this.setPrimary(userId, newPhoto.photo_id);
      }

      return newPhoto;
    } catch (err: any) {
      if (err.message?.includes('maximum of 6 photos')) {
        throw new BadRequestException('You can only have up to 6 photos.');
      }
      throw err;
    }
  }

  async setPrimary(userId: string, photoId: string) {
    const result = await Bun.sql`
      UPDATE PHOTOS 
      SET IS_PRIMARY = (PHOTO_ID = ${photoId})
      WHERE UPLOADER_ID = ${userId}
      RETURNING *
    `;

    return result.find((p: any) => p.is_primary) || result[0];
  }

  async findByUser(userId: string) {
    return await Bun.sql`
      SELECT * FROM PHOTOS WHERE UPLOADER_ID = ${userId} ORDER BY IS_PRIMARY DESC, IMAGE_URL ASC
    `;
  }

  async delete(userId: string, photoId: string) {
    return await Bun.sql`
      DELETE FROM PHOTOS WHERE PHOTO_ID = ${photoId} AND UPLOADER_ID = ${userId}
    `;
  }
}
