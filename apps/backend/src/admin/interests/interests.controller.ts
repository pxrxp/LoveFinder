import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminInterestsService } from '../interests/interests.service';
import { AdminGuard } from '../../auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin/interests')
export class AdminInterestsController {
  constructor(private readonly interestsService: AdminInterestsService) {}

  @Get('pending')
  getPending() {
    return this.interestsService.getPendingInterests();
  }

  @Patch(':interest_id/approve')
  approveInterest(@Param('interest_id', ParseIntPipe) interest_id: number) {
    return this.interestsService.approveInterest(interest_id);
  }

  @Patch(':interest_id/reject')
  rejectInterest(@Param('interest_id', ParseIntPipe) interest_id: number) {
    return this.interestsService.rejectInterest(interest_id);
  }
}
