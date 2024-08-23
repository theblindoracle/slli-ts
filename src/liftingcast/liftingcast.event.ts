import {
  MeetDocument,
  RefDecision,
  RefDecisionCards,
} from './liftingcast.enteties';

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
  meetID: string;
  platformID: string;
  position: string;
  decision: RefDecision;
  cards: RefDecisionCards;
}

export class CurrentAttemptUpdatedEvent extends Event<CurrentAttemptUpdatedEvent> {
  meetID: string;
  platformID: string;
  meetDocument: MeetDocument;
}

export class ClockStateChangedEvent extends Event<ClockStateChangedEvent> {
  meetID: string;
  platformID: string;
  previousState: string;
  currentState: string;
  clockDuration: number;
}
