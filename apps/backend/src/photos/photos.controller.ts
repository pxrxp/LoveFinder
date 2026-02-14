import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { UserDto } from '../users/dto/user.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  create(
    @GetUser() user: UserDto,
    @Body() body: CreatePhotoDto
  ) {
    return this.photosService.create(
      user.user_id,
      body.image_url,
      body.is_primary || false
    );
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
