import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Render,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SessionManagerService } from './slli.service';
import { SlliPreMeetService } from './premeet/premeet.service';
import { GetRecordsDTO } from './slli.dtos';
import { RecordsService } from 'src/records/records.service';

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

  @Post('generate')
  generate(
    @Query('meetID') meetID: string,
    @Query('password') password: string,
  ) {
    return this.premeetService.generatePreMeetReport(meetID, password);
  }

  @Get()
  @Render('premeet')
  root() {}

  @Post('generateRecords')
  @UsePipes(new ValidationPipe({ transform: true }))
  storeRecords(@Body() getRecordsDTO: GetRecordsDTO) {
    return this.premeetService.getRecords(
      getRecordsDTO.equipmentLevels,
      getRecordsDTO.recordLevels,
      getRecordsDTO.divisions,
    );
  }

  @Get('records')
  @Render('records')
  async records() {
    const records = await this.recordsService.findAll();
    return { records: records };
  }
}
