import { Test, TestingModule } from '@nestjs/testing';
import { LiftingcastService } from './liftingcast.service';

describe('LiftingcastService', () => {
  let service: LiftingcastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiftingcastService],
    }).compile();

    service = module.get<LiftingcastService>(LiftingcastService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
