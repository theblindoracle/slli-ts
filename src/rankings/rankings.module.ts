import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './rankings.entity';
import { UsaplModule } from 'src/usapl/usapl.module';
import { RankingsModel } from './rankings.model';

@Module({
  imports: [TypeOrmModule.forFeature([Ranking]), UsaplModule],
  providers: [RankingsService, RankingsModel],
  controllers: [RankingsController],
})
export class RankingsModule { }
