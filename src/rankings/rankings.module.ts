import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './rankings.entity';
import { RankingsModel } from './rankings.model';

@Module({
  imports: [TypeOrmModule.forFeature([Ranking])],
  providers: [RankingsService, RankingsModel],
  controllers: [RankingsController],
  exports: [
    RankingsModel,
    RankingsService,
    TypeOrmModule.forFeature([Ranking]),
  ],
})
export class RankingsModule {}
