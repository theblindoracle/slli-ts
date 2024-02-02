import { ClockState } from 'src/liftingcast/liftingcast.enteties';
import { TimerControl } from '../singularlive.payloads';

export class ShortTimerComp {
  shortTimerCompID = 'c465993c-6d75-40e7-3aee-3ecedaaccd66';

  buildPayload(clockState: ClockState, clockLength: number): ShortTimerPayload {
    const isRunning = clockState === 'started';
    const value = clockState === 'initial' ? clockLength * 1000 : 0;

    const timerControl: TimerControl = {
      UTC: Date.now(),
      isRunning,
      value,
    };

    return { timerControl, clockLength };
  }
}

export type ShortTimerPayload = {
  timerControl: TimerControl;
  clockLength: number;
};
