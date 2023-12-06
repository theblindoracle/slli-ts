import { Test, TestingModule } from '@nestjs/testing';
import { SingularliveService } from './singularlive.service';

describe('SingularliveService', () => {
  let service: SingularliveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SingularliveService],
    }).compile();

    service = module.get<SingularliveService>(SingularliveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
