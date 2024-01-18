import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClockState } from 'src/liftingcast/liftingcast.enteties';
import {
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  RefLightUpdatedEvent,
} from 'src/liftingcast/liftingcast.event';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { MainScene } from 'src/singularlive/singularlive.mainscene';
import { SingularliveService } from 'src/singularlive/singularlive.service';

@Injectable()
export class SessionManagerService {
  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly singularService: SingularliveService,
    private readonly eventEmitter: EventEmitter2,
  ) { }
  private readonly logger = new Logger(SessionManagerService.name);

  private readonly sessions = Array<SessionDetails>();

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

    // the main scene needs to be instantiated to listen to events
    const mainScene = new MainScene(
      this.singularService,
      session.singularAppToken,
    );

    let seqNumber = '0';
    let previousClockState: ClockState = 'initial';
    let previousClockTimerLength: number;
    let previousAttemptId: string;

    const processDocumentChanges = async () => {
      this.logger.log('starting poll process');
      const response = await this.liftingcastService.listenForDocumentChanges(
        session.liftingcastMeetID,
        session.liftingcastPlatformID,
        session.liftingcastPassword,
        seqNumber,
      );

      this.logger.log(
        'sessionDetails',
        session.liftingcastMeetID,
        session.liftingcastPlatformID,
        session.liftingcastPassword,
        seqNumber,
      );

      if (response.status !== HttpStatus.OK) {
        this.logger.error(response.status);
        this.logger.error(response.statusText);
        this.logger.error(response.data);
        return;
      }

      const data = response.data;
      seqNumber = data.last_seq;

      const platformDoc = data.results.find(
        (result) => result.doc._id === session.liftingcastPlatformID,
      )?.doc;
      if (platformDoc) {
        if (platformDoc.currentAttemptId !== previousAttemptId) {
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

      lightDocs.forEach((lightDoc) => {
        this.eventEmitter.emit(
          LiftingcastEvents.RefLightUpdatedEvent,
          new RefLightUpdatedEvent({ payload: lightDoc }),
        );
      });
    };

    while (true) {
      await processDocumentChanges();
    }
  }
}

type SessionDetails = {
  liftingcastMeetID: string;
  liftingcastPlatformID: string;
  liftingcastPassword: string;
  singularAppToken: string;
};

class SlliSession {
  constructor(private readonly sessionDetails: SessionDetails) { }
}
