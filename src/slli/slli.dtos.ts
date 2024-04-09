import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';
import {
  DivisionOptions,
  EquipmentLevelOptions,
  RecordLevelOptions,
} from 'src/usapl/usapl.dtos';

export class GetRecordsDTO {
  @IsArray()
  @ArrayNotEmpty()
  equipmentLevels: Array<EquipmentLevelOptions>;

  @IsArray()
  @ArrayNotEmpty()
  recordLevels: Array<RecordLevelOptions>;

  @IsArray()
  @ArrayNotEmpty()
  divisions: Array<DivisionOptions>;
}
export class StartDTO {
  @IsString()
  meetID: string;

  @IsString()
  platformID: string;

  @IsString()
  password: string;

  @IsString()
  token: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  sceneType: number;
}

export class DeleteDTO {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;
}
