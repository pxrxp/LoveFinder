import { Injectable } from '@nestjs/common';

@Injectable()
export class InterestsService {

  async addInterestToUser(user_id: string, interest_id: number) {
    return (
      await Bun.sql`
        INSERT INTO USER_INTERESTS (INTEREST_ID, USER_ID)
        VALUES (${interest_id}, ${user_id})
        ON CONFLICT DO NOTHING
        RETURNING *
      `
    )[0];
  }

  async removeInterestFromUser(user_id: string, interest_id: number) {
    await Bun.sql`
      DELETE FROM USER_INTERESTS
      WHERE USER_ID = ${user_id}
        AND INTEREST_ID = ${interest_id}
    `;
  }

  async getUserInterests(user_id: string) {
    return Bun.sql`
      SELECT I.*
      FROM INTERESTS I
      JOIN USER_INTERESTS UI
        ON UI.INTEREST_ID = I.INTEREST_ID
      WHERE UI.USER_ID = ${user_id}
    `;
  }
}
