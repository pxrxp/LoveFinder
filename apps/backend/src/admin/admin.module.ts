import { Module } from '@nestjs/common';
import { AdminInterestsController } from './interests/interests.controller';
import { AdminReportsController } from './reports/reports.controller';
import { AdminReportsService } from './reports/reports.service';
import { AdminInterestsService } from './interests/interests.service';

@Module({
  controllers: [AdminInterestsController, AdminReportsController],
  providers: [AdminReportsService, AdminInterestsService]
})
export class AdminModule {}
