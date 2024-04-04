import { Controller, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { SessionManagerService } from './slli.service';
import { SlliPreMeetService } from './premeet/premeet.service';

@Controller('slli')
export class SlliController {
  logger = new Logger(SlliController.name);
  constructor(
    private readonly slliService: SessionManagerService,
    private readonly premeetService: SlliPreMeetService,
  ) {}

  @Post('startSession')
  startSession(
    @Query('meetID') meetID: string,
    @Query('platformID') platformID: string,
    @Query('password') password: string,
    @Query('token') token: string,
    @Query('sceneType') sceneType: string,
  ) {
    this.slliService.startSession(
      meetID,
      platformID,
      password,
      token,
      +sceneType,
    );
  }

  @Post('generate')
  generate(
    @Query('meetID') meetID: string,
    @Query('password') password: string,
  ) {
    return this.premeetService.generatePreMeetReport(meetID, password);
  }
}
