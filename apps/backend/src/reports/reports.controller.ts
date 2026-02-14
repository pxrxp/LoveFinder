import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from '../users/dto/user.dto';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post(':reported_id')
  create(
    @GetUser() user: UserDto,
    @Param('reported_id', ParseUUIDPipe) reported_id: string,
    @Body() body: CreateReportDto
  ) {
    return this.reportsService.create(
      user.user_id,
      reported_id,
      body.reason,
      body.details
    );
  }

  @Patch(':report_id/status')
  updateStatus(
    @Param('report_id') report_id: string,
    @Body() body: { status: string }
  ) {
    return this.reportsService.updateStatus(report_id, body.status);
  }

  @Get('pending')
  findPending() {
    return this.reportsService.findPending();
  }
}
