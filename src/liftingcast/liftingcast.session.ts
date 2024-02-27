import { HttpStatus, Logger } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClockState, LightDoc } from './liftingcast.enteties';
import {
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  RefLightUpdatedEvent,
} from './liftingcast.event';

export class LiftingcastSession {
  private readonly logger = new Logger(LiftingcastSession.name);
  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly eventEmitter: EventEmitter2,
    public meetID: string,
    public platformID: string,
    private readonly password: string,
  ) {}

  private lock: object;
  lastUpdate: Date;

  stopPoll() {
    this.lock = null;
  }

  async startPoll() {
    if (this.lock) return;

    this.lock = {};

    let seqNumber = '0';

    let previousClockState: ClockState = 'initial';
    let previousClockTimerLength: number;
    let previousAttemptId: string;
    let previousAttemptChangeInProgress = false;

    this.logger.log(
      `starting poll process for ${this.meetID}:${this.platformID}`,
    );
    // while (Date.now() - lastUpdate < 1000 * 60 * 60) {
    while (this.lock) {
      const response = await this.liftingcastService.listenForDocumentChanges(
        this.meetID,
        this.platformID,
        this.password,
        seqNumber,
      );

      if (response.status !== HttpStatus.OK) {
        this.logger.warn('listenForDocumentChanges failed');
        this.logger.warn('restarting poll');
        continue;
      }

      const data = response.data;

      if (seqNumber !== data.last_seq) {
        seqNumber = data.last_seq;
        this.lastUpdate = new Date();
      }

      const platformDoc = data.results.find(
        (result) => result.doc._id === this.platformID,
      )?.doc;
      if (platformDoc) {
        if (
          platformDoc.currentAttemptId !== previousAttemptId ||
          platformDoc.attemptChangeInProgress !==
            // eslint-disable-next-line prettier/prettier
            previousAttemptChangeInProgress
        ) {
          const meetDocument = await this.liftingcastService.getMeetData(
            this.meetID,
          );
          this.eventEmitter.emit(
            LiftingcastEvents.CurrentAttemptUpdated,
            new CurrentAttemptUpdatedEvent({
              meetID: this.meetID,
              platformID: this.platformID,
              meetDocument: meetDocument,
            }),
          );

          previousAttemptId = platformDoc.currentAttemptId;
          // TODO: turn this into its own event
          previousAttemptChangeInProgress = platformDoc.attemptChangeInProgress;
        }

        if (
          platformDoc.clockState !== previousClockState ||
          previousClockTimerLength !== platformDoc.clockTimerLength
        ) {
          this.eventEmitter.emit(
            LiftingcastEvents.ClockStateChanged,
            new ClockStateChangedEvent({
              platformID: this.platformID,
              previousState: previousClockState,
              currentState: platformDoc.clockState,
              clockDuration: platformDoc.clockTimerLength,
            }),
          );

          previousClockState = platformDoc.clockState;
          previousClockTimerLength = platformDoc.clockTimerLength;
        }
      }

      const lightDocs = data.results
        .filter((res) => res.doc._id.startsWith('r'))
        .map((res) => res.doc);

      lightDocs.forEach((lightDoc: LightDoc) => {
        this.eventEmitter.emit(
          LiftingcastEvents.RefLightUpdatedEvent,
          new RefLightUpdatedEvent({
            platformID: lightDoc.platformId,
            position: lightDoc.position,
            decision: lightDoc.decision,
            cards: lightDoc.cards,
          }),
        );
      });
    }
    this.logger.log('stopping poll process');
  }
}
