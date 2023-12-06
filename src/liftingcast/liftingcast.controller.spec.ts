import { Test, TestingModule } from '@nestjs/testing';
import { LiftingcastController } from './liftingcast.controller';

describe('LiftingcastController', () => {
  let controller: LiftingcastController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiftingcastController],
    }).compile();

    controller = module.get<LiftingcastController>(LiftingcastController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
