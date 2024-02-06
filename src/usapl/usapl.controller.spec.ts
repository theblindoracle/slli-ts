import { Test, TestingModule } from '@nestjs/testing';
import { UsaplController } from './usapl.controller';

describe('UsaplController', () => {
  let controller: UsaplController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsaplController],
    }).compile();

    controller = module.get<UsaplController>(UsaplController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
