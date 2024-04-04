import { Controller, Get } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';

@Controller('liftingcast')
export class LiftingcastController {
  constructor(private liftingcastService: LiftingcastService) {}

  @Get('meet')
  async getMeet() {
    return this.liftingcastService.getMeetData('mrbnhnayoz5e', 'test');
  }
}
