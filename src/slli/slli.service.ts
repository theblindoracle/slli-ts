import { Injectable, Logger } from '@nestjs/common';
import { LiftingcastSessionService } from 'src/liftingcast/liftingcast.sessionService';
import { SceneManagerService } from 'src/singularlive/singularlive.scenemanager';

@Injectable()
export class SessionManagerService {
  constructor(
    private readonly liftingcastSessionService: LiftingcastSessionService,
    private readonly sceneManagerService: SceneManagerService,
  ) {}
  private readonly logger = new Logger(SessionManagerService.name);

  id = 0;
  sessions = new Array<SessionDetails>();

  getSessions() {
    return this.sessions;
  }

  stopSession(id: number) {
    const idx = this.sessions.findIndex((session) => session.id === id);

    if (idx !== -1) {
      const session = this.sessions[idx];

      const lcSessionCount = this.sessions.filter(
        (sess) =>
          sess.liftingcastMeetID === session.liftingcastMeetID &&
          sess.liftingcastPlatformID === session.liftingcastPlatformID,
      ).length;
      if (lcSessionCount <= 1) {
        this.liftingcastSessionService.stopSession(
          session.liftingcastMeetID,
          session.liftingcastPlatformID,
        );
      }

      this.sceneManagerService.removeScene(session.singularAppToken);

      this.sessions.splice(idx, 1);
    }
  }

  async startSession(
    liftingcastMeetID: string,
    liftingcastPlatformID: string,
    liftingcastPassword: string,
    singularAppToken: string,
    sceneType: number,
  ) {
    const session = {
      id: this.id,
      liftingcastMeetID,
      liftingcastPlatformID,
      liftingcastPassword,
      singularAppToken,
      sceneType,
    } as SessionDetails;

    this.id += 1;

    this.sessions.push(session);
    this.logger.log('starting session', session);

    this.liftingcastSessionService.startSession(
      liftingcastMeetID,
      liftingcastPlatformID,
      liftingcastPassword,
    );

    this.sceneManagerService.addScene(
      singularAppToken,
      sceneType,
      liftingcastMeetID,
      liftingcastPlatformID,
    );
  }
}

type SessionDetails = {
  id: number;
  liftingcastMeetID: string;
  liftingcastPlatformID: string;
  liftingcastPassword: string;
  singularAppToken: string;
  sceneType: number;
};
