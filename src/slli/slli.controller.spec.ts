import { Test, TestingModule } from '@nestjs/testing';
import { SlliController } from './slli.controller';

describe('SlliController', () => {
  let controller: SlliController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlliController],
    }).compile();

    controller = module.get<SlliController>(SlliController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
