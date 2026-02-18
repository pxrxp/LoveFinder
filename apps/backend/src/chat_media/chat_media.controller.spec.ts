import { Test, TestingModule } from '@nestjs/testing';
import { ChatMediaController } from './chat_media.controller';

describe('ChatMediaController', () => {
  let controller: ChatMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatMediaController],
    }).compile();

    controller = module.get<ChatMediaController>(ChatMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
