import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
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
  uploadChatMedia(
    @Request() req: ExpressRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file');

    const baseUrl =
      process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/static/chat/${file.filename}`;
    console.log(`[ChatMediaController] Uploaded media stored at: ${url}`);

    return {
      url,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
