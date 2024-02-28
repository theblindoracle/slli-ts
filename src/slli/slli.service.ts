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

  sessions = new Array<SessionDetails>();

  async startSession(
    liftingcastMeetID: string,
    liftingcastPlatformID: string,
    liftingcastPassword: string,
    singularAppToken: string,
    sceneType: number,
  ) {
    const session = {
      liftingcastMeetID,
      liftingcastPlatformID,
      liftingcastPassword,
      singularAppToken,
      sceneType,
    } as SessionDetails;

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
  liftingcastMeetID: string;
  liftingcastPlatformID: string;
  liftingcastPassword: string;
  singularAppToken: string;
  sceneType: number;
};
