import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { WeightClass, Division, RankingEntry, Record } from './usapl.enteties';
import {
  DisciplineOptions,
  DivisionOptions,
  EquipmentLevelOptions,
  OrderByOptions,
  RecordLevelOptions,
  SexOptions,
  USStates,
  WeightClassOptions,
} from './usapl.dtos';

@Injectable()
export class UsaplService {
  private readonly logger = new Logger(UsaplService.name);
  private usaplDbBaseUrl = 'https://usapl.liftingdatabase.com/api';
  constructor(private readonly httpService: HttpService) { }

  async getDivisions() {
    const url = `${this.usaplDbBaseUrl}/divisions`;

    const { data } = await firstValueFrom(
      this.httpService.get<Array<Division>>(url),
    );
    return data;
  }

  async getWeightClasses() {
    const url = `${this.usaplDbBaseUrl}/weightclasses`;

    const { data } = await firstValueFrom(
      this.httpService.get<Array<WeightClass>>(url),
    );

    return data;
  }

  async getRecords(getRecordsDTO?: Partial<GetRecordsDTO>) {
    const url = `${this.usaplDbBaseUrl}/records`;
    const queryParameters = new URLSearchParams();
    if (
      getRecordsDTO.equipmentLevel !== undefined &&
      getRecordsDTO.equipmentLevel !== null
    ) {
      queryParameters.append('equipmentLevel', getRecordsDTO.equipmentLevel);
    }
    if (
      getRecordsDTO.recordLevel !== undefined &&
      getRecordsDTO.recordLevel !== null
    ) {
      queryParameters.append('recordLevel', getRecordsDTO.recordLevel);
    }
    if (
      getRecordsDTO.division !== undefined &&
      getRecordsDTO.division !== null
    ) {
      queryParameters.append('division', getRecordsDTO.division);
    }
    if (
      getRecordsDTO.weightClass !== undefined &&
      getRecordsDTO.weightClass !== null
    ) {
      queryParameters.append('weightClass', getRecordsDTO.weightClass);
    }
    if (getRecordsDTO.sex !== undefined && getRecordsDTO.sex !== null) {
      queryParameters.append('sex', getRecordsDTO.sex);
    }
    if (getRecordsDTO.state !== undefined && getRecordsDTO.state !== null) {
      queryParameters.append('state', getRecordsDTO.state);
    }
    this.logger.debug(queryParameters);
    const { data } = await firstValueFrom(
      this.httpService.get<Array<Record>>(url, { params: queryParameters }),
    );

    return data;
  }

  async getRanking(getRankingsDTO: Partial<GetRankingsDTO>) {
    const url = `${this.usaplDbBaseUrl}/ranking`;
    const queryParameters = new URLSearchParams();

    if (getRankingsDTO.equipmentLevel) {
      queryParameters.append('equipmentLevel', getRankingsDTO.equipmentLevel);
    }
    if (getRankingsDTO.division) {
      queryParameters.append('division', getRankingsDTO.division);
    }
    if (getRankingsDTO.weightClass) {
      queryParameters.append('weightClass', getRankingsDTO.weightClass);
    }
    if (getRankingsDTO.sex) {
      queryParameters.append('sex', getRankingsDTO.sex);
    }
    if (getRankingsDTO.discipline) {
      queryParameters.append('discipline', getRankingsDTO.discipline);
    }
    if (getRankingsDTO.orderBy) {
      queryParameters.append('orderBy', getRankingsDTO.orderBy);
    }

    const { data } = await firstValueFrom(
      this.httpService.get<Array<RankingEntry>>(url, {
        params: queryParameters,
      }),
    );

    return data;
  }
}

export type GetRecordsDTO = {
  equipmentLevel?: EquipmentLevelOptions;
  recordLevel?: RecordLevelOptions;
  division?: DivisionOptions;
  weightClass?: string;
  sex?: SexOptions;
  state?: USStates;
};

export type GetRankingsDTO = {
  equipmentLevel?: EquipmentLevelOptions;
  division?: DivisionOptions;
  weightClass?: WeightClassOptions;
  sex?: SexOptions;
  discipline?: DisciplineOptions;
  orderBy?: OrderByOptions;
};
