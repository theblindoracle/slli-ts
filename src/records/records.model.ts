import { Injectable, Logger } from '@nestjs/common';
import { RecordsService } from './records.service';
import {
  slliToUsaplDivisionMap,
  slliToUsaplEquipmentMap,
  slliToUsaplGenderMap,
} from 'src/slli/premeet/premeet.service';
import { USStates } from 'src/usapl/usapl.dtos';
import { Record } from './records.entity';
import { LiftingcastDivisionDecoder } from 'src/liftingcast/liftingcast.decoder';

@Injectable()
export class RecordsModel {
  private readonly logger = new Logger(RecordsModel.name);
  constructor(private readonly recordsService: RecordsService) {}

  async getBestDivisionRecord(
    lcWeightClass: string,
    lcDivisionName: string,
    lcUsState: string,
    lcDiscipline: string,
    weight: number,
    total: number,
  ): Promise<Record | null> {
    const divisionDetails = new LiftingcastDivisionDecoder().decode(
      lcDivisionName,
    );
    this.logger.debug(divisionDetails);
    const equipment = slliToUsaplEquipmentMap.get(
      divisionDetails.equipmentLevel,
    );

    const division = slliToUsaplDivisionMap.get(divisionDetails.ageGroup);
    const gender = slliToUsaplGenderMap.get(divisionDetails.gender);

    const stateRecords = await this.recordsService.findBy({
      recordLevel: 'state',
      equipmentLevel: equipment,
      sex: gender,
      division,
      usState: USStates[lcUsState],
      weightClassID: lcWeightClass,
    });

    const americanRecord = await this.recordsService.findBy({
      recordLevel: 'american',
      equipmentLevel: equipment,
      sex: gender,
      division,
      weightClassID: lcWeightClass,
    });

    const worldRecords = await this.recordsService.findBy({
      recordLevel: 'world',
      equipmentLevel: equipment,
      sex: gender,
      division,
      weightClassID: lcWeightClass,
    });

    if (lcDiscipline === 'dead') {
      const totalWorldRecords = worldRecords
        .filter(
          (record) =>
            record.discipline.toLowerCase() === 'total' &&
            record.weight < total,
        )
        .sort((a, b) => b.weight - a.weight);

      const totalAmericanRecords = americanRecord
        .filter(
          (record) =>
            record.discipline.toLowerCase() === 'total' &&
            record.weight < total,
        )
        .sort((a, b) => b.weight - a.weight);

      const totalStateRecords = stateRecords
        .filter(
          (record) =>
            record.discipline.toLowerCase() === 'total' &&
            record.weight < total,
        )
        .sort((a, b) => b.weight - a.weight);

      this.logger.debug('total records');
      this.logger.debug(totalWorldRecords);
      this.logger.debug(totalAmericanRecords);
      this.logger.debug(totalStateRecords);
      if (totalWorldRecords.length > 0) {
        return totalWorldRecords[0];
      }
      if (totalAmericanRecords.length > 0) {
        return totalAmericanRecords[0];
      }
      if (totalStateRecords.length > 0) {
        return totalStateRecords[0];
      }
    }

    const disciplineWorldRecords = worldRecords
      .filter(
        (record) =>
          record.discipline.toLowerCase().includes(lcDiscipline) &&
          record.weight < weight,
      )
      .sort((a, b) => b.weight - a.weight);

    const disciplineAmericanRecords = americanRecord
      .filter(
        (record) =>
          record.discipline.toLowerCase().includes(lcDiscipline) &&
          record.weight < weight,
      )
      .sort((a, b) => b.weight - a.weight);

    const disciplineStateRecords = stateRecords
      .filter(
        (record) =>
          record.discipline.toLowerCase().includes(lcDiscipline) &&
          record.weight < weight,
      )
      .sort((a, b) => b.weight - a.weight);

    this.logger.debug(lcDiscipline);
    this.logger.debug(`filtered Records for ${lcDiscipline} and total`);
    this.logger.debug(disciplineWorldRecords);
    this.logger.debug(disciplineAmericanRecords);
    this.logger.debug(disciplineStateRecords);

    if (disciplineWorldRecords.length > 0) {
      return disciplineWorldRecords[0];
    }
    if (disciplineAmericanRecords.length > 0) {
      return disciplineAmericanRecords[0];
    }
    if (disciplineStateRecords.length > 0) {
      return disciplineStateRecords[0];
    }

    return null;
  }
}
