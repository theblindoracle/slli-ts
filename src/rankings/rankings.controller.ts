import { Controller, Get, Post } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsModel } from './rankings.model';

@Controller('rankings')
export class RankingsController {
  constructor(
    private readonly rankingsModel: RankingsModel,
    private readonly rankingsService: RankingsService,
  ) { }

  @Get()
  async get() {
    return await this.rankingsService.findAll();
  }

  @Get('topFive')
  async getTopFive() {
    return await this.rankingsModel.getTopFiveRankings();
  }
}
