import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClockState, LightDoc } from 'src/liftingcast/liftingcast.enteties';
import {
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  RefLightUpdatedEvent,
} from 'src/liftingcast/liftingcast.event';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { SceneManagerService } from 'src/singularlive/singularlive.scenemanager';
import { SingularliveService } from 'src/singularlive/singularlive.service';

@Injectable()
export class SessionManagerService {
  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly eventEmitter: EventEmitter2,
    private readonly sceneManager: SceneManagerService,
  ) {}
  private readonly logger = new Logger(SessionManagerService.name);

  sessions = new Array<SessionDetails>();

  async startSession(
    liftingcastMeetID: string,
    liftingcastPlatformID: string,
    liftingcastPassword: string,
    singularAppToken: string,
  ) {
    const session = {
      liftingcastMeetID,
      liftingcastPlatformID,
      liftingcastPassword,
      singularAppToken,
    } as SessionDetails;

    this.sessions.push(session);

    this.eventEmitter.emit('slli.startSession', session);
  }

  @OnEvent('slli.startSession', { async: true })
  async startPoll(session: SessionDetails) {
    //this need to move. It should part of the factory process
    await this.sceneManager.addScene(
      session.liftingcastMeetID,
      session.liftingcastPlatformID,
      session.singularAppToken,
    );

    let seqNumber = '0';
    let previousClockState: ClockState = 'initial';
    let previousClockTimerLength: number;
    let previousAttemptId: string;
    let previousAttemptChangeInProgress = false;
    let lastUpdate = Date.now();

    this.logger.log(
      `starting poll process for ${session.liftingcastMeetID}:${session.liftingcastPlatformID}`,
    );
    while (Date.now() - lastUpdate < 1000 * 60 * 30) {
      const response = await this.liftingcastService.listenForDocumentChanges(
        session.liftingcastMeetID,
        session.liftingcastPlatformID,
        session.liftingcastPassword,
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
        lastUpdate = Date.now();
      }

      const platformDoc = data.results.find(
        (result) => result.doc._id === session.liftingcastPlatformID,
      )?.doc;
      if (platformDoc) {
        if (
          platformDoc.currentAttemptId !== previousAttemptId ||
          platformDoc.attemptChangeInProgress !==
            previousAttemptChangeInProgress
        ) {
          const meetDocument = await this.liftingcastService.getMeetData(
            session.liftingcastMeetID,
          );
          this.eventEmitter.emit(
            LiftingcastEvents.CurrentAttemptUpdated,
            new CurrentAttemptUpdatedEvent({
              meetID: session.liftingcastMeetID,
              platformID: session.liftingcastPlatformID,
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

type SessionDetails = {
  liftingcastMeetID: string;
  liftingcastPlatformID: string;
  liftingcastPassword: string;
  singularAppToken: string;
};
