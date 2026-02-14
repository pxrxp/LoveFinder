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

  async updateStatus(report_id: string, status: string) {
    return (
      await Bun.sql`
        UPDATE REPORTS
        SET STATUS = ${status}::T_REPORT_STATUS
        WHERE REPORT_ID = ${report_id}
        RETURNING *
      `
    )[0];
  }

  async findPending() {
    return Bun.sql`
      SELECT *
      FROM REPORTS
      WHERE STATUS = 'under_review'
    `;
  }
}
