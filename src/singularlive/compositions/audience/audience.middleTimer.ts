import { ClockState } from 'src/liftingcast/liftingcast.enteties';
import { TimerControl } from 'src/singularlive/singularlive.payloads';

export class MiddleTimerWidget {
  compID = '59644d3e-a713-4e6c-a067-23596d376fbc';

  buildPayload(
    clockState: ClockState,
    clockLength: number,
  ): MiddleTimerPayload {
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

export type MiddleTimerPayload = {
  timerControl: TimerControl;
  clockLength: number;
};
