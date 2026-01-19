import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: any) {
    const limit = Number(value.limit ?? 10);
    const offset = Number(value.offset ?? 0);

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('limit must be a number between 1 and 50');
    }
    if (isNaN(offset) || offset < 0) {
      throw new BadRequestException('offset must be a number >= 0');
    }

    return { limit, offset };
  }
}

