import { Controller, Get } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';

@Controller('liftingcast')
export class LiftingcastController {
  constructor(private liftingcastService: LiftingcastService) { }

  @Get('start')
  async start() {
    this.liftingcastService.start();
  }

  @Get('stop')
  async stop() {
    this.liftingcastService.stop();
  }

  @Get('meet')
  async getMeet() {
    return this.liftingcastService.getMeetData();
  }
}
