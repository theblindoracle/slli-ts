import { ArrayNotEmpty, IsArray } from 'class-validator';
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
