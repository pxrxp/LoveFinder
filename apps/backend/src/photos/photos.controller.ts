import { BadRequestException, Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { UserDto } from '../users/dto/user.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, randomUUID() + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.startsWith('image/') &&
          !file.mimetype.startsWith('video/') &&
          !file.mimetype.startsWith('audio/')
        ) {
          cb(new Error('Invalid file type'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  upload(
    @GetUser() user: UserDto,
    @UploadedFile() file: Express.Multer.File,
    @Query('is_primary', ParseBoolPipe) is_primary?: boolean,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided or file type invalid');
    }
    const url = `${process.env.BACKEND_URL}/static/${file.filename}`;
    return this.photosService.create(user.user_id, url, is_primary ?? false);
  }

  @Post(':photo_id/primary')
  setPrimary(
    @GetUser() user: UserDto,
    @Param('photo_id') photo_id: string
  ) {
    return this.photosService.setPrimary(user.user_id, photo_id);
  }

  @Get('me')
  findMyPhotos(@GetUser() user: UserDto) {
    return this.photosService.findByUser(user.user_id);
  }

  @Delete(':photo_id')
  delete(
    @GetUser() user: UserDto,
    @Param('photo_id') photo_id: string
  ) {
    return this.photosService.delete(user.user_id, photo_id);
  }
}
