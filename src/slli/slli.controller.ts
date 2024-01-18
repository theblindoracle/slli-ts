import { Controller, Param, Patch, Post } from '@nestjs/common';
import { SessionManagerService } from './slli.service';

@Controller('slli')
export class SlliController {
  constructor(private readonly slliService: SessionManagerService) { }

  @Post('pre-meet')
  preMeet() {
    return 'premeet';
  }

  @Patch('startSession')
  startSession(
    @Param('meetID') meetID: string,
    @Param('platformID') platformID: string,
    @Param('password') password: string,
    @Param('token') token: string,
  ) {
    this.slliService.startSession(meetID, platformID, password, token);
  }
}
