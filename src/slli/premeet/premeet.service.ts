import { Injectable, Logger } from '@nestjs/common';
import { Division, LifterDivision } from 'src/liftingcast/liftingcast.enteties';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import {
  GetRankingsDTO,
  GetRecordsDTO,
  UsaplService,
} from 'src/usapl/usapl.service';
import { LiftingcastDivisionDecoder } from 'src/liftingcast/liftingcast.decoder';
import { AgeGroup, EquipmentLevel, Gender } from '../slli.enteties';
import {
  DivisionOptions,
  EquipmentLevelOptions,
  RecordLevelOptions,
  SexOptions,
  USStates,
  WeightClassOptions,
} from 'src/usapl/usapl.dtos';
import { RecordsService } from 'src/records/records.service';
import { RecordDTO } from 'src/records/records.dto';
import { RankingsService } from 'src/rankings/rankings.service';
import { RankingDTO } from 'src/rankings/rankings.dto';

@Injectable()
export class SlliPreMeetService {
  private readonly logger = new Logger(SlliPreMeetService.name);
  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly usaplService: UsaplService,
    private readonly recordsService: RecordsService,
    private readonly rankingsService: RankingsService,
  ) {}

  private readonly divisionDecoder = new LiftingcastDivisionDecoder();
  async generatePreMeetReport(meetID: string, password: string) {
    // get roster and their divisions from liftingcast
    const liftingcastData = await this.liftingcastService.getMeetData(
      meetID,
      password,
    );

    let getRecordsDTOs: Array<GetRecordsDTO> = [];

    for (const lifter of liftingcastData.lifters) {
      //translate liftingcast to USAPL

      lifter.divisions.forEach((division) => {
        const divisionDetails = liftingcastData.divisions.find(
          (divisionDetails) => divisionDetails.id === division.divisionId,
        );

        const recordDTO = this.generateRecordDTO(
          division,
          divisionDetails,
          lifter.state,
        );
        getRecordsDTOs.push(...recordDTO);
      });
    }

    getRecordsDTOs = getRecordsDTOs.filter(
      (obj, index) =>
        getRecordsDTOs.findIndex(
          (dto) =>
            dto.state === obj.state &&
            dto.sex === obj.sex &&
            dto.division === obj.division &&
            dto.recordLevel === obj.recordLevel &&
            dto.weightClass === obj.weightClass &&
            dto.equipmentLevel === obj.equipmentLevel,
        ) === index,
    );

    // get records from usapl database

    for (const getRecordDTO of getRecordsDTOs) {
      const usaplRecords = await this.usaplService.getRecords(getRecordDTO);

      if (usaplRecords.length === 0) {
        this.logger.warn(`no records found for ${getRecordDTO}`);
      }
      for (const usaplRecord of usaplRecords) {
        const record: RecordDTO = {
          weight: usaplRecord.weight,
          recordLevel: getRecordDTO.recordLevel,
          weightClassID: usaplRecord.weightClass.name.replace('-', ''),
          discipline: usaplRecord.discipline,
          division: usaplRecord.division,
          sex: getRecordDTO.sex,
          equipmentLevel: getRecordDTO.equipmentLevel,
        };

        if (getRecordDTO.recordLevel === 'state') {
          record.usState = getRecordDTO.state;
        }

        await this.recordsService.create(record);
      }
    }

    // return records;
    // save to db
    return await this.recordsService.findAll();
  }

  private generateRecordDTO(
    lifterDivision: LifterDivision,
    divisionDetails: Division,
    state?: string,
  ): Partial<GetRecordsDTO[]> {
    const weightClass = divisionDetails.weightClasses.find(
      (weightClass) => weightClass.id === lifterDivision.weightClassId,
    );
    const divisionDecoded = this.divisionDecoder.decode(divisionDetails.name);

    const weightClassName = weightClass.name.includes('+')
      ? weightClass.name
      : `-${weightClass.name}`;

    const dto = {
      weightClass: weightClassName,
      equipmentLevel: slliToUsaplEquipmentMap.get(
        divisionDecoded.equipmentLevel,
      ),
      division: slliToUsaplDivisionMap.get(divisionDecoded.ageGroup),
      sex: slliToUsaplGenderMap.get(divisionDecoded.gender),
    };
    const dtos: Array<GetRecordsDTO> = [
      { ...dto, recordLevel: 'american' },
      { ...dto, recordLevel: 'world' },
    ];

    if (state) {
      dtos.push({
        ...dto,
        recordLevel: 'state',
        state: USStates[state],
      });
    }

    return dtos;
  }

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

  async getRecords(
    equipmentLevels: Array<EquipmentLevelOptions>,
    recordLevels: Array<RecordLevelOptions>,
    divisions: Array<DivisionOptions>,
  ) {
    const getRecordsDTOs = new Array<GetRecordsDTO>();

    // const equipmentLevels: Array<EquipmentLevelOptions> = ['raw', 'equipped'];

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

    for (const division of divisions) {
      for (const recordLevel of recordLevels) {
        for (const equipmentLevel of equipmentLevels) {
          for (const weightClass of maleWeightClasses) {
            getRecordsDTOs.push({
              equipmentLevel: equipmentLevel,
              weightClass: weightClass,
              division: division,
              sex: 'm',
              recordLevel: recordLevel,
              // state: ''
            });
          }

          for (const weightClass of femaleWeightClasses) {
            getRecordsDTOs.push({
              equipmentLevel: equipmentLevel,
              weightClass: weightClass,
              division: division,
              sex: 'f',
              recordLevel: recordLevel,
              // state: ''
            });
          }
        }
      }
    }
    this.logger.debug(getRecordsDTOs);
    // get roster and their divisions from liftingcast
    // const liftingcastData = await this.liftingcastService.getMeetData(
    //   meetID,
    //   password,
    // );
    //
    // let getRecordsDTOs: Array<GetRecordsDTO> = [];
    //
    // for (const lifter of liftingcastData.lifters) {
    //   //translate liftingcast to USAPL
    //
    //   lifter.divisions.forEach((division) => {
    //     const divisionDetails = liftingcastData.divisions.find(
    //       (divisionDetails) => divisionDetails.id === division.divisionId,
    //     );
    //
    //     const recordDTO = this.generateRecordDTO(
    //       division,
    //       divisionDetails,
    //       lifter.state,
    //     );
    //     getRecordsDTOs.push(...recordDTO);
    //   });
    // }
    //
    // getRecordsDTOs = getRecordsDTOs.filter(
    //   (obj, index) =>
    //     getRecordsDTOs.findIndex(
    //       (dto) =>
    //         dto.state === obj.state &&
    //         dto.sex === obj.sex &&
    //         dto.division === obj.division &&
    //         dto.recordLevel === obj.recordLevel &&
    //         dto.weightClass === obj.weightClass &&
    //         dto.equipmentLevel === obj.equipmentLevel,
    //     ) === index,
    // );

    // get records from usapl database

    // for (const getRecordDTO of getRecordsDTOs) {
    //   const usaplRecords = await this.usaplService.getRecords(getRecordDTO);
    //
    //   if (usaplRecords.length === 0) {
    //     this.logger.warn(`no records found for: `, getRecordDTO);
    //   }
    //   for (const usaplRecord of usaplRecords) {
    //     const record: RecordDTO = {
    //       weight: usaplRecord.weight,
    //       recordLevel: getRecordDTO.recordLevel,
    //       weightClassID: usaplRecord.weightClass.name.replace('-', ''),
    //       discipline: usaplRecord.discipline,
    //       division: usaplRecord.division,
    //       sex: getRecordDTO.sex,
    //       equipmentLevel: getRecordDTO.equipmentLevel,
    //     };
    //
    //     if (getRecordDTO.recordLevel === 'state') {
    //       record.usState = getRecordDTO.state;
    //     }
    //
    //     await this.recordsService.create(record);
    //   }
    // }
    //
    // // return records;
    // // save to db
    // return await this.recordsService.findAll();
  }
}
export const slliToUsaplEquipmentMap = new Map<
  EquipmentLevel,
  EquipmentLevelOptions
>([
  [EquipmentLevel.Raw, 'raw'],
  [EquipmentLevel.RawWithWraps, 'raw_with_wraps'],
  [EquipmentLevel.Equipped, 'equipped'],
]);

export const slliToUsaplGenderMap = new Map<Gender, SexOptions>([
  [Gender.Male, 'm'],
  [Gender.Female, 'f'],
  [Gender.Mx, 'mx'],
]);

export const slliToUsaplDivisionMap = new Map<AgeGroup, DivisionOptions>([
  [AgeGroup.Youth, DivisionOptions.Youth],
  [AgeGroup.Youth1, DivisionOptions.Youth1],
  [AgeGroup.Youth2, DivisionOptions.Youth2],
  [AgeGroup.Youth3, DivisionOptions.Youth3],
  [AgeGroup.Teen, DivisionOptions.Teen],
  [AgeGroup.Teen1, DivisionOptions.Teen1],
  [AgeGroup.Teen2, DivisionOptions.Teen2],
  [AgeGroup.Teen3, DivisionOptions.Teen3],
  [AgeGroup.Junior, DivisionOptions.Junior],
  [AgeGroup.Open, DivisionOptions.Open],
  [AgeGroup.Master, DivisionOptions.Master],
  [AgeGroup.Master1, DivisionOptions.Master1],
  [AgeGroup.Master1A, DivisionOptions.Master1a],
  [AgeGroup.Master1B, DivisionOptions.Master1b],
  [AgeGroup.Master2, DivisionOptions.Master2],
  [AgeGroup.Master2A, DivisionOptions.Master2a],
  [AgeGroup.Master2B, DivisionOptions.Master2b],
  [AgeGroup.Master3, DivisionOptions.Master3],
  [AgeGroup.Master3A, DivisionOptions.Master3a],
  [AgeGroup.Master3B, DivisionOptions.Master3b],
  [AgeGroup.Master4, DivisionOptions.Master4],
  [AgeGroup.Master4A, DivisionOptions.Master4a],
  [AgeGroup.Master4B, DivisionOptions.Master4b],
  [AgeGroup.Master5, DivisionOptions.Master5],
  [AgeGroup.Master5A, DivisionOptions.Master5a],
  [AgeGroup.Master5B, DivisionOptions.Master5b],
  [AgeGroup.Master6, DivisionOptions.Master6],
  [AgeGroup.Master6A, DivisionOptions.Master6a],
  [AgeGroup.Master6B, DivisionOptions.Master6],
  [AgeGroup.Guest, DivisionOptions.Guest],
  [AgeGroup.Collegiate, DivisionOptions.Collegiate],
  [AgeGroup.HighSchool, DivisionOptions.HighSchool],
  [AgeGroup.HighSchoolVarsity, DivisionOptions.HighSchoolVarsity],
  [AgeGroup.HighSchoolJV, DivisionOptions.HighSchoolJV],
]);
