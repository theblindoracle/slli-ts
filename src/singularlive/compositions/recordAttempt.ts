import { SingularColor } from '../singularlive.payloads';

export class RecordAttemptComp {
  compID = '545affc7-0bbb-8438-519a-140e0eec8c27';

  buildPayload(
    recordLevel: RecordLevel,
    division: string,
    weightClass: string,
  ): RecordAttemptPayload {
    let bgColor = '';
    let textColor = '';
    switch (recordLevel) {
      case 'state':
        bgColor = '#db1717';
        textColor = '#ffffff';
      case 'national':
        bgColor = '#1767db';
        textColor = '#ffffff';
      case 'world':
        bgColor = '#f5ea48';
        textColor = '#000000';
    }

    const recordText = `${recordLevel} ${division} record attempt - ${weightClass}`;

    return { recordText, textColor, bgColor };
  }
}

type RecordLevel = 'state' | 'national' | 'world';

export type RecordAttemptPayload = {
  recordText: string;
  textColor: SingularColor;
  bgColor: SingularColor;
};
