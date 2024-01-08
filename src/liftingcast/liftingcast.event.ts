class Event<Type> {
  constructor(init?: Partial<Type>) {
    Object.assign(this, init);
  }
}

export enum LiftingcastEvents {
  CurrentAttemptUpdated = 'liftingcast.currentAttemptUpdated',
  ClockStateChanged = 'liftingcast.clockStateChanged',
  RefLightUpdatedEvent = 'liftingcast.refLightUpdated',
}

export class RefLightUpdatedEvent extends Event<RefLightUpdatedEvent> {
  payload: {};
}

export class CurrentAttemptUpdatedEvent extends Event<CurrentAttemptUpdatedEvent> {
  currentAttemptId: string;
}

export class ClockStateChangedEvent extends Event<ClockStateChangedEvent> {
  previousState: string;
  currentState: string;
  clockDuration: number;
}
