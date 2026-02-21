import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CursorPaginationPipe implements PipeTransform {
  transform(value: any) {
    const limit = Number(value.limit ?? 20);
    const cursor = value.cursor ?? null;

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('limit must be between 1 and 50');
    }

    if (cursor && isNaN(Date.parse(cursor))) {
      throw new BadRequestException('cursor must be valid timestamp');
    }

    return {
      limit,
      cursor,
    };
  }
}
