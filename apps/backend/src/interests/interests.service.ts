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
      SELECT I.INTEREST_ID, I.INTEREST_NAME
      FROM INTERESTS I
      JOIN USER_INTERESTS UI
        ON UI.INTEREST_ID = I.INTEREST_ID
      WHERE UI.USER_ID = ${user_id}
    `;
  }

  async getApprovedInterests() {
    return Bun.sql`
      SELECT INTEREST_ID, INTEREST_NAME
      FROM INTERESTS
      WHERE is_approved = TRUE
      ORDER BY interest_name
    `;
  }

  async requestInterest(interest_name: string) {
    const normalized = interest_name.trim();

    const existing = await Bun.sql`
      SELECT INTEREST_ID, INTEREST_NAME
      FROM INTERESTS
      WHERE interest_name = ${normalized}
    `;

    if (existing.length > 0) {
      return { message: 'Interest already exists', interest: existing[0] };
    }

    return (
      await Bun.sql`
        INSERT INTO INTERESTS (interest_name, is_approved)
        VALUES (${normalized}, FALSE)
        RETURNING *
      `
    )[0];
  }
}
