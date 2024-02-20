import { DivisionOptions } from 'src/usapl/usapl.dtos';
import { SingularColor } from '../singularlive.payloads';
import { Record } from 'src/records/records.entity';

export class RecordAttemptComp {
  compID = '545affc7-0bbb-8438-519a-140e0eec8c27';

  buildPayload(record: Record): RecordAttemptPayload {
    let bgColor = '';
    let textColor = '';
    switch (record.recordLevel) {
      case 'state':
        bgColor = '#c21e1e';
        textColor = '#ffffff';
        break;
      case 'american':
        bgColor = '#333fb9';
        textColor = '#ffffff';
        break;
      case 'national':
        bgColor = '#2c2c2c';
        textColor = '#ffffff';
        break;
      case 'world':
      default:
        bgColor = '#a8911c';
        textColor = '#000000';
        break;
    }

    const division =
      Object.keys(DivisionOptions)[
        Object.values(DivisionOptions).indexOf(
          record.division as DivisionOptions,
        )
      ];

    const recordText = `${record.recordLevel} ${record.equipmentLevel} ${division} ${record.discipline} record attempt - ${record.weightClassID} KG`;
    console.log(recordText);
    return { recordText, textColor, bgColor };
  }
}

export type RecordAttemptPayload = {
  recordText: string;
  textColor: SingularColor;
  bgColor: SingularColor;
};
