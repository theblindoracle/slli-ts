import { SingularColor } from '../singularlive.payloads';

export class SuccessfulRecordComp {
  compID = '7dc7c554-76c0-4730-83d3-212bf6f09010';

  buildPayload(recordLevel: string): SuccessfulRecordPayload {
    switch (recordLevel) {
      case 'state':
        return { recordLabel: 'new state record', bgColor: '#c21e1e' };
      case 'american':
        return { recordLabel: 'new american record', bgColor: '#333fb9' };
      case 'national':
        return { recordLabel: 'new national record', bgColor: '#2c2c2c' };
      case 'world':
        return { recordLabel: 'new world record', bgColor: '#a8911c' };
    }
  }
}

export type SuccessfulRecordPayload = {
  bgColor: SingularColor;
  recordLabel: string;
};
