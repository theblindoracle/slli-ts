import { Controller, Get, Post } from '@nestjs/common';
import { RecordsService } from './records.service';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('create')
  create() {
    return this.recordsService.create({
      weight: 52.5,
      recordLevel: 'American',
      equipmentLevel: 'raw',
      weightClassID: '2',
      sex: 'f',
      discipline: 'Bench',
      division: 'Junior',
    });
  }

  @Get()
  get() {
    return this.recordsService.findAll();
  }

  @Get('weight')
  getById() {
    return this.recordsService.findBy({ discipline: 'Bench' });
  }
}
