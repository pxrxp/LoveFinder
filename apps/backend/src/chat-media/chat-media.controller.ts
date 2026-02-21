import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('chat-media')
export class ChatMediaController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, cb) => {
          cb(null, randomUUID() + extname(file.originalname));
        },
      }),
      fileFilter: (_, file, cb) => {
        if (
          !file.mimetype.startsWith('image/') &&
          !file.mimetype.startsWith('video/') &&
          !file.mimetype.startsWith('audio/')
        ) {
          cb(new BadRequestException('Invalid type'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadChatMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');

    return {
      url: `${process.env.BACKEND_URL}/static/chat/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
