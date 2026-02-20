import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {

  async create(
    reporter_id: string,
    reported_id: string,
    reason: string,
    details: string
  ) {
    return (
      await Bun.sql`
        INSERT INTO REPORTS (
          REPORTER_ID,
          REPORTED_ID,
          REASON,
          DETAILS
        )
        VALUES (
          ${reporter_id},
          ${reported_id},
          ${reason}::T_REPORT_REASON,
          ${details}
        )
        RETURNING *
      `
    )[0];
  }

  async findPending(reporter_id: string) {
    return Bun.sql`
      SELECT *
      FROM REPORTS
      WHERE STATUS = 'under_review'
          AND REPORTER_ID = ${reporter_id}
    `;
  }
}
