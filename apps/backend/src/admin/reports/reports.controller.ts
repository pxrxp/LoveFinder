import { Body, Controller, Get, Param, Patch, ParseUUIDPipe, UseGuards, ParseEnumPipe } from '@nestjs/common';
import { AdminReportsService } from './reports.service';
import { AdminGuard } from '../../auth/guards/admin.guard';

enum ReportStatus {
  UNDER_REVIEW = 'under_review',
  DISMISSED = 'dismissed',
  ACTION_TAKEN = 'action_taken',
}

@UseGuards(AdminGuard)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get('pending')
  findPending() {
    return this.reportsService.findAllPending();
  }

  @Patch(':report_id/status')
  updateStatus(
    @Param('report_id', ParseUUIDPipe) report_id: string,
    @Body('status', new ParseEnumPipe(ReportStatus)) body: { status: ReportStatus }
  ) {
    return this.reportsService.updateStatus(report_id, body.status);
  }
}
