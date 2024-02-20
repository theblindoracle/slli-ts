import { SingularColor } from '../singularlive.payloads';

export class SuccessfulRecordComp {
  compID = '99a12b5f-fb5e-42d6-ac9f-77f014c12c57';

  buildPayload(recordLevel: string): SuccessfulRecordPayload {
    switch (recordLevel) {
      case 'state':
        return { recordLabel: 'new state record', bgColor: '#c21e1e' };
      case 'national':
        return { recordLabel: 'new american record', bgColor: '#333fb9' };
      case 'national':
        return { recordLabel: 'new american record', bgColor: '#2c2c2c' };
      case 'world':
        return { recordLabel: 'new world record', bgColor: '#a8911c' };
    }
  }
}

export type SuccessfulRecordPayload = {
  bgColor: SingularColor;
  recordLabel: string;
};
