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
  ) { }

  private lock: object;
  lastUpdate: Date;
  stopPoll() {
    this.lock = null;
  }

  seqNumber = '0';
  async startPoll() {
    if (this.lock) return;

    this.lock = {};

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
        this.seqNumber,
      );

      if (response.status !== HttpStatus.OK) {
        this.logger.warn(
          `listenForDocumentChanges failed ${this.meetID}:${this.platformID}`,
        );
        this.logger.warn('restarting poll');
        continue;
      }

      const data = response.data;

      if (this.seqNumber !== data.last_seq) {
        this.seqNumber = data.last_seq;
        this.lastUpdate = new Date();
      }

      const platformDoc = data.results.find(
        (result) => result.doc._id === this.platformID,
      )?.doc;
      if (platformDoc) {
        if (
          platformDoc.currentAttemptId !== previousAttemptId ||
          (platformDoc.attemptChangeInProgress === false &&
            previousAttemptChangeInProgress === true)
        ) {
          const meetDocument = await this.liftingcastService.getMeetData(
            this.meetID,
            this.password,
          );
          const event = new CurrentAttemptUpdatedEvent({
            meetID: this.meetID,
            platformID: this.platformID,
            meetDocument: meetDocument,
          });
          this.eventEmitter.emit(
            LiftingcastEvents.CurrentAttemptUpdated,
            event,
          );

          previousAttemptId = platformDoc.currentAttemptId;
        }
        // turn this into its own event
        previousAttemptChangeInProgress = platformDoc.attemptChangeInProgress;
        if (
          platformDoc.clockState !== previousClockState ||
          previousClockTimerLength !== platformDoc.clockTimerLength
        ) {
          this.eventEmitter.emit(
            LiftingcastEvents.ClockStateChanged,
            new ClockStateChangedEvent({
              meetID: this.meetID,
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
            meetID: this.meetID,
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
