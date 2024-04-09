import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Render,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SessionManagerService } from './slli.service';
import { SlliPreMeetService } from './premeet/premeet.service';
import { DeleteDTO, GetRecordsDTO, StartDTO } from './slli.dtos';
import { RecordsService } from 'src/records/records.service';
import { Response } from 'express';

@Controller('slli')
export class SlliController {
  logger = new Logger(SlliController.name);
  constructor(
    private readonly slliService: SessionManagerService,
    private readonly premeetService: SlliPreMeetService,
    private readonly recordsService: RecordsService,
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

  @Get('session')
  @Render('session')
  session() {
    return { sessions: this.slliService.getSessions() };
  }

  @Post('session/create')
  @UsePipes(new ValidationPipe({ transform: true }))
  start(@Res() res: Response, @Body() startDTO: StartDTO) {
    this.slliService.startSession(
      startDTO.meetID,
      startDTO.platformID,
      startDTO.password,
      startDTO.token,
      startDTO.sceneType,
    );
    return res.redirect('/slli/session');
  }

  @Post('session/delete')
  @UsePipes(new ValidationPipe({ transform: true }))
  delete(@Body() deleteDTO: DeleteDTO, @Res() res: Response) {
    this.slliService.stopSession(deleteDTO.id);
    return res.redirect('/slli/session');
  }

  // @Post('generate')
  // generate(
  //   @Query('meetID') meetID: string,
  //   @Query('password') password: string,
  // ) {
  //   return this.premeetService.generatePreMeetReport(meetID, password);
  // }

  @Get()
  @Render('premeet')
  root() {}

  @Post('generateRecords')
  @UsePipes(new ValidationPipe({ transform: true }))
  async storeRecords(
    @Res() res: Response,
    @Body() getRecordsDTO: GetRecordsDTO,
  ) {
    await this.premeetService.getRecords(
      getRecordsDTO.equipmentLevels,
      getRecordsDTO.recordLevels,
      getRecordsDTO.divisions,
    );
    return res.redirect('/slli/records');
  }

  @Get('records')
  @Render('records')
  async records() {
    const records = await this.recordsService.findAll();
    return { records: records };
  }
}
