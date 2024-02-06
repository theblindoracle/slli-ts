import { Controller, Get } from '@nestjs/common';
import { UsaplService } from './usapl.service';
import { DivisionOptions, USStates } from './usapl.dtos';

@Controller('usapl')
export class UsaplController {
  constructor(private readonly usaplService: UsaplService) { }

  @Get()
  get() {
    return this.usaplService.getRecords({
      equipmentLevel: 'raw',
      recordLevel: 'american',
      division: DivisionOptions.Open,
      weightClass: '-110',
      state: USStates.PA,
    });
  }
}
