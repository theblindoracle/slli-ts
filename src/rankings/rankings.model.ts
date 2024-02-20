import { Injectable, Logger } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { GetRankingsDTO, UsaplService } from 'src/usapl/usapl.service';
import {
  DivisionOptions,
  EquipmentLevelOptions,
  WeightClassOptions,
} from 'src/usapl/usapl.dtos';
import { RankingDTO } from './rankings.dto';

@Injectable()
export class RankingsModel {
  private readonly logger = new Logger(RankingsModel.name);
  constructor(
    private readonly rankingsService: RankingsService,
    private readonly usaplService: UsaplService,
  ) {}

  async getRankings() {
    const getRankingsDTOs = new Array<GetRankingsDTO>();

    const equipmentLevels: Array<EquipmentLevelOptions> = ['raw', 'equipped'];

    const maleWeightClasses: Array<WeightClassOptions> = [
      '-30',
      '-35',
      '-40',
      '-44',
      '-48',
      '-52',
      '-56',
      '-60',
      '-67.5',
      '-75',
      '-82.5',
      '-90',
      '-100',
      '-110',
      '-125',
      '-140',
      '140+',
    ];

    const femaleWeightClasses: Array<WeightClassOptions> = [
      '-30',
      '-35',
      '-40',
      '-44',
      '-48',
      '-52',
      '-56',
      '-60',
      '-67.5',
      '-75',
      '-82.5',
      '-90',
      '-100',
      '100+',
    ];

    for (const equipmentLevel of equipmentLevels) {
      for (const weightClass of maleWeightClasses) {
        getRankingsDTOs.push({
          equipmentLevel: equipmentLevel,
          weightClass: weightClass,
          division: DivisionOptions.Open,
          orderBy: 'points_dots',
          discipline: 'total',
          sex: 'm',
        });
      }

      for (const weightClass of femaleWeightClasses) {
        getRankingsDTOs.push({
          equipmentLevel: equipmentLevel,
          weightClass: weightClass,
          division: DivisionOptions.Open,
          orderBy: 'points_dots',
          discipline: 'total',
          sex: 'f',
        });
      }
    }

    for (const getRankingsDTO of getRankingsDTOs) {
      this.logger.log('Getting Rankings from USAPL DB');
      this.logger.log(getRankingsDTO);

      const usaplRankings = await this.usaplService.getRanking(getRankingsDTO);

      this.logger.log(usaplRankings);

      const rankingDTOs = new Array<RankingDTO>();

      for (const ranking of usaplRankings) {
        const dto: RankingDTO = {
          name: `${ranking.lifter.firstName} ${ranking.lifter.lastName}`,
          position: ranking.position,
          points: ranking.points,
          sex: ranking.lifter.sex,
          equipmentLevel: getRankingsDTO.equipmentLevel,
          discipline: getRankingsDTO.discipline,
          division: getRankingsDTO.division,
          weightClassID: getRankingsDTO.weightClass.replace('-', ''),
        };

        rankingDTOs.push(dto);
      }

      for (const dto of rankingDTOs) {
        await this.rankingsService.create(dto);
      }
    }
    //get ranking from usapl db

    return await this.rankingsService.findAll();
  }
}
