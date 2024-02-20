import { Controller, Post } from '@nestjs/common';
import { RankingsModel } from './rankings.model';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsModel: RankingsModel) { }

  @Post('generate')
  async generate() {
    return await this.rankingsModel.getRankings();
  }
}
