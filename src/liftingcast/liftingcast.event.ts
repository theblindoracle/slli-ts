import { MeetDocument } from './liftingcast.enteties';

class Event<Type> {
  constructor(init?: Partial<Type>) {
    Object.assign(this, init);
  }
}

export enum LiftingcastEvents {
  CurrentAttemptUpdated = 'liftingcast.currentAttemptUpdated',
  ClockStateChanged = 'liftingcast.clockStateChanged',
  RefLightUpdatedEvent = 'liftingcast.refLightUpdated',
  MeetDocumentUpdated = 'liftingcast.meetDocumentUpdated',
}

export class RefLightUpdatedEvent extends Event<RefLightUpdatedEvent> {
  payload: {};
}

export class CurrentAttemptUpdatedEvent extends Event<CurrentAttemptUpdatedEvent> {
  meetId: string;
  currentAttemptId: string;
}

export class ClockStateChangedEvent extends Event<ClockStateChangedEvent> {
  previousState: string;
  currentState: string;
  clockDuration: number;
}

export class MeetDocumentUpdatedEvent extends Event<MeetDocumentUpdatedEvent> {
  meetDocument: MeetDocument;
}
