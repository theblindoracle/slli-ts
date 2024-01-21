import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClockState } from 'src/liftingcast/liftingcast.enteties';
import {
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  RefLightUpdatedEvent,
} from 'src/liftingcast/liftingcast.event';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { MainScene } from 'src/singularlive/scenes/singularlive.mainscene';
import { SceneManagerService } from 'src/singularlive/singularlive.scenemanager';
import { SingularliveService } from 'src/singularlive/singularlive.service';

@Injectable()
export class SessionManagerService {
  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly singularService: SingularliveService,
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

    // this.eventEmitter.on(
    //   LiftingcastEvents.CurrentAttemptUpdated,
    //   (e) => this.handleOnCurrentAttemptUpdated(e),
    //   { async: true },
    // );
  }

  // async handleOnCurrentAttemptUpdated(e: CurrentAttemptUpdatedEvent) {
  //   this.logger.log(
  //     LiftingcastEvents.CurrentAttemptUpdated,
  //     e.platformID,
  //     e.meetID,
  //   );
  //
  //   const session = this.sessions.find(
  //     (session) => session.liftingcastMeetID === e.meetID,
  //   );
  //
  //   const mainScene = new MainScene(
  //     this.singularService,
  //     session.singularAppToken,
  //   );
  //
  //   this.logger.log('Updating main scene');
  //   const meetDocument = e.meetDocument;
  //
  //   const platform = meetDocument.platforms.find(
  //     (platform) => platform.id === e.platformID,
  //   );
  //
  //   const currentLifter = meetDocument.lifters.find(
  //     (lifter) => (lifter.id = platform.currentAttempt.lifter.id),
  //   );
  //
  //   const division = meetDocument.divisions.find(
  //     (division) => division.id === currentLifter.divisions[0].divisionId,
  //   );
  //
  //   const weightClass = division.weightClasses.find(
  //     (weightClass) =>
  //       weightClass.id === currentLifter.divisions[0].weightClassId,
  //   );
  //
  //   const nextLifters = platform.nextAttempts
  //     .map((attempt) => attempt.lifter.id)
  //     .map(
  //       (lifterId) =>
  //         meetDocument.lifters.find((lifter) => lifter.id === lifterId).name,
  //     );
  //
  //   this.logger.debug(currentLifter.name);
  //
  //   await mainScene.playAttemptChange(
  //     currentLifter,
  //     platform.currentAttempt,
  //     `${division.name} - ${weightClass.name}`,
  //     nextLifters,
  //   );
  // }

  @OnEvent(LiftingcastEvents.ClockStateChanged)
  onClockStateChanged(e: ClockStateChangedEvent) {
    this.logger.log(
      LiftingcastEvents.ClockStateChanged,
      e.currentState,
      e.previousState,
      e.clockDuration,
    );
  }

  @OnEvent('slli.startSession', { async: true })
  async startPoll(session: SessionDetails) {
    //this need to move. It should part of the factory process
    this.sceneManager.createMainScene(
      session.liftingcastMeetID,
      session.liftingcastPlatformID,
      session.singularAppToken,
    );

    let seqNumber = '0';
    let previousClockState: ClockState = 'initial';
    let previousClockTimerLength: number;
    let previousAttemptId: string;
    let lastUpdate = Date.now();

    this.logger.log('starting poll process');
    while (Date.now() - lastUpdate < 1000 * 60 * 2) {
      const response = await this.liftingcastService.listenForDocumentChanges(
        session.liftingcastMeetID,
        session.liftingcastPlatformID,
        session.liftingcastPassword,
        seqNumber,
      );

      if (response.status !== HttpStatus.OK) {
        this.logger.error('listenForDocumentChanges failed');
        this.logger.error('restarting poll');
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
