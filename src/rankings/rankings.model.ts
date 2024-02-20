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
    });

    const searchResults = fuse.search(lcName);

    this.logger.log(searchResults);

    if (searchResults.length > 0) {
      return searchResults[0].item;
    }

    return null;
  }
}
