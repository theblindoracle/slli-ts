import { Lift } from 'src/liftingcast/liftingcast.enteties';
import { colors } from 'src/singularlive/singularlive.constants';
import { SingularColor } from 'src/singularlive/singularlive.payloads';

class AttemptWidget {
  compID: string;
  constructor(compID: string) {
    this.compID = compID;
  }
  getAttemptTextColor = (attemptResult: string, isAttemptActive: boolean) => {
    if (isAttemptActive) {
      return colors.audienceOverlays.lift.current;
    } else if (attemptResult === 'good') {
      return colors.audienceOverlays.lift.good;
    } else if (attemptResult === 'bad') {
      return colors.audienceOverlays.lift.bad;
    } else {
      return colors.audienceOverlays.lift.future;
    }
  };

  buildAttemptPayload = (lift: Lift, isAttemptActive: boolean) => {
    const attempt = lift.weight ?? '-';
    const textColor = this.getAttemptTextColor(lift.result, isAttemptActive);
    const bgOpacity = isAttemptActive ? '100' : '70';

    return {
      attempt,
      textColor,
      isAttemptActive,
      bgOpacity,
    };
  };
}

export class Attempt1Widget extends AttemptWidget {
  constructor() {
    super('20da858d-3093-4321-9d01-7241b6544d16');
  }
}

export class Attempt2Widget extends AttemptWidget {
  constructor() {
    super('e21e82f6-30b7-45e2-bbfe-76e72fbfff70');
  }
}

export class Attempt3Widget extends AttemptWidget {
  constructor() {
    super('9f6120eb-2d6b-4aac-9c8b-e15f3cdd1195');
  }
}
export type AttemptPayload = {
  bgOpacity: string;
  attempt: string;
  isAttemptActive: boolean;
  textColor: SingularColor;
};
