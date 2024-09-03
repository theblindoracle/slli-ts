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
import { DeleteDTO, GetRecordsDTO, CreateDTO, StartDTO, StopDTO } from './slli.dtos';
import { RecordsService } from 'src/records/records.service';
import { Response } from 'express';
import { SessionService } from 'src/session/session.service';

@Controller('slli')
export class SlliController {
  logger = new Logger(SlliController.name);
  constructor(
    private readonly slliService: SessionManagerService,
    private readonly premeetService: SlliPreMeetService,
    private readonly recordsService: RecordsService,
    private readonly sessionService: SessionService,
  ) { }

  @Get('session')
  @Render('session')
  async session() {
    const sessions = await this.sessionService.findAll();
    return { sessions: sessions };
  }

  @Post('session/create')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Res() res: Response, @Body() startDTO: CreateDTO) {
    await this.slliService.createSession(
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
  async delete(@Body() deleteDTO: DeleteDTO, @Res() res: Response) {
    await this.slliService.deleteSession(deleteDTO.id);
    return res.redirect('/slli/session');
  }

  @Post('session/start')
  @UsePipes(new ValidationPipe({ transform: true }))
  async start(@Body() startDTO: StartDTO, @Res() res: Response) {
    await this.slliService.startSession(startDTO.id);
    return res.redirect('/slli/session');
  }

  @Post('session/stop')
  @UsePipes(new ValidationPipe({ transform: true }))
  async stop(@Body() startDTO: StopDTO, @Res() res: Response) {
    await this.slliService.stopSession(startDTO.id);
    return res.redirect('/slli/session');
  }

  @Get()
  @Render('premeet')
  root() { }

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
