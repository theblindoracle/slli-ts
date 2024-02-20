import { Controller, Get, Post } from '@nestjs/common';
import { RankingsModel } from './rankings.model';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsModel: RankingsModel) {}
}
