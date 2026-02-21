import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminInterestsService {
  async getPendingInterests() {
    return Bun.sql`
    SELECT *
    FROM INTERESTS
    WHERE is_approved = FALSE
    ORDER BY interest_name
  `;
  }

  async approveInterest(interest_id: number) {
    return Bun.sql`
    UPDATE INTERESTS
    SET is_approved = TRUE
    WHERE INTEREST_ID = ${interest_id}
    RETURNING *
  `;
  }

  async rejectInterest(interest_id: number) {
    return Bun.sql`
    DELETE FROM INTERESTS
    WHERE INTEREST_ID = ${interest_id}
    RETURNING *
  `;
  }
}
