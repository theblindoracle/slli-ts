import { Injectable, Logger } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import Fuse from 'fuse.js';
import { LiftingcastDivisionDecoder } from 'src/liftingcast/liftingcast.decoder';
import {
  slliToUsaplEquipmentMap,
  slliToUsaplGenderMap,
} from 'src/slli/premeet/premeet.service';
import { Ranking } from './rankings.entity';

@Injectable()
export class RankingsModel {
  private readonly logger = new Logger(RankingsModel.name);
  constructor(private readonly rankingsService: RankingsService) {}

  async getLifterRanking(
    lcName: string,
    lcWeightClass: string,
    lcDivisionName: string,
  ): Promise<Ranking | null> {
    const divisionDetails = new LiftingcastDivisionDecoder().decode(
      lcDivisionName,
    );

    const equipment = slliToUsaplEquipmentMap.get(
      divisionDetails.equipmentLevel,
    );

    const gender = slliToUsaplGenderMap.get(divisionDetails.gender);

    const rankings = await this.rankingsService.findBy({
      weightClassID: lcWeightClass,

      equipmentLevel: equipment,
      sex: gender,
    });

    const fuse = new Fuse(rankings, {
      keys: ['name'],
      isCaseSensitive: false,
      includeScore: true,
      threshold: 0.15,
    });

    const searchResults = fuse.search(lcName).sort((a, b) => b.score - a.score);
    this.logger.debug('rankings search results', lcName, searchResults);
    if (searchResults.length > 0) {
      return searchResults[0].item;
    }

    return null;
  }

  async getTopFiveRankings() {
    const equipmentLevels: Array<string> = ['raw', 'equipped'];
    const maleWeightClasses: Array<string> = [
      '30',
      '35',
      '40',
      '44',
      '48',
      '52',
      '56',
      '60',
      '67.5',
      '75',
      '82.5',
      '90',
      '100',
      '110',
      '125',
      '140',
      '140+',
    ];

    const femaleWeightClasses: Array<string> = [
      '30',
      '35',
      '40',
      '44',
      '48',
      '52',
      '56',
      '60',
      '67.5',
      '75',
      '82.5',
      '90',
      '100',
      '100+',
    ];
    const rankings = [];
    for (const equipmentLevel of equipmentLevels) {
      for (const weightClass of maleWeightClasses) {
        const mensRankings = await this.rankingsService.findBy({
          sex: 'm',
          weightClassID: weightClass,
          equipmentLevel: equipmentLevel,
        });
        const sortedAndSliced = mensRankings
          .sort((a, b) => a.position - b.position)
          .slice(0, 5);
        rankings.push(...sortedAndSliced);
      }

      for (const weightClass of femaleWeightClasses) {
        const womensRankings = await this.rankingsService.findBy({
          sex: 'f',
          weightClassID: weightClass,
          equipmentLevel: equipmentLevel,
        });
        const sortedAndSliced = womensRankings
          .sort((a, b) => a.position - b.position)
          .slice(0, 5);
        rankings.push(...sortedAndSliced);
      }
    }
    return rankings;
  }
}
