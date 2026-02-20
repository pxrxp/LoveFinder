import { Body, Controller, Get, Param, Patch, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AdminReportsService } from './reports.service';
import { AdminGuard } from '../../auth/guards/admin.guard';

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
    @Body('status') body: { status: 'under_review' | 'dismissed' | 'action_taken' }
  ) {
    return this.reportsService.updateStatus(report_id, body.status);
  }
}
