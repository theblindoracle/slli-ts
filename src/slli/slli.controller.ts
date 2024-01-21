import { Controller, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { SessionManagerService } from './slli.service';

@Controller('slli')
export class SlliController {
  logger = new Logger(SlliController.name);
  constructor(private readonly slliService: SessionManagerService) {}

  @Post('startSession')
  startSession(
    @Query('meetID') meetID: string,
    @Query('platformID') platformID: string,
    @Query('password') password: string,
    @Query('token') token: string,
  ) {
    this.slliService.startSession(meetID, platformID, password, token);
  }
}
