import { Test, TestingModule } from '@nestjs/testing';
import { SingularliveController } from './singularlive.controller';

describe('SingularliveController', () => {
  let controller: SingularliveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SingularliveController],
    }).compile();

    controller = module.get<SingularliveController>(SingularliveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
