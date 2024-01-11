import { Controller, Patch, Post } from '@nestjs/common';
import { SessionManagerService } from './slli.service';

@Controller('slli')
export class SlliController {
  constructor(private readonly slliService: SessionManagerService) {}

  @Post('pre-meet')
  preMeet() {
    return 'premeet';
  }

  @Patch('startSession')
  startSession() {
    this.slliService.startSession('mqky3v477ua5', 'ppjiq0g8i70b', 'test');
  }
}
