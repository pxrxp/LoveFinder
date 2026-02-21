import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminReportsService {
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

  async findAllPending() {
    return Bun.sql`
      SELECT *
      FROM REPORTS
      WHERE STATUS = 'under_review'
    `;
  }
}
