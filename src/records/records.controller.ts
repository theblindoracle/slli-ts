import { Controller, Get, Post } from '@nestjs/common';
import { RecordsService } from './records.service';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) { }

  @Post('create')
  create() {
    return this.recordsService.create({
      weight: 52.5,
      recordList: "Women's American Raw Records",
      weightClassID: '2',
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

  @Post('seed')
  async seed() {
    await this.recordsService.create({
      weight: 52.5,
      recordList: "Women's American Raw Records",
      weightClassID: '2',
      discipline: 'Bench',
      division: 'Open',
    });
    await this.recordsService.create({
      weight: 52.5,
      recordList: "Women's American Raw Records",
      weightClassID: '2',
      discipline: 'Bench',
      division: 'Masters',
    });
    await this.recordsService.create({
      weight: 52.5,
      recordList: "Women's American Raw Records",
      weightClassID: '3',
      discipline: 'Bench',
      division: 'Open',
    });
    await this.recordsService.create({
      weight: 52.5,
      recordList: "Women's American Raw Records",
      weightClassID: '3',
      discipline: 'Bench',
      division: 'Junior',
    });
    await this.recordsService.create({
      weight: 152.5,
      recordList: "Women's American Raw Records",
      weightClassID: '4',
      discipline: 'Deadlift',
      division: 'Teen',
    });
    await this.recordsService.create({
      weight: 352.5,
      recordList: "Women's American Raw Records",
      weightClassID: '4',
      discipline: 'Deadlift',
      division: 'Masters',
    });
  }
}
