import { SingularColor } from '../singularlive.payloads';

export class SuccessfulRecordComp {
  compID = '99a12b5f-fb5e-42d6-ac9f-77f014c12c57';

  buildPayload(recordLevel: RecordLevel): SuccessfulRecordPayload {
    switch (recordLevel) {
      case 'state':
        return { recordLabel: 'new state record', bgColor: '#870e0e' };
      case 'national':
        return { recordLabel: 'new american record', bgColor: '#1d2574' };
      case 'world':
        return { recordLabel: 'new world record', bgColor: '#a9942e' };
    }
  }
}

type RecordLevel = 'state' | 'national' | 'world';

export type SuccessfulRecordPayload = {
  bgColor: SingularColor;
  recordLabel: string;
};
