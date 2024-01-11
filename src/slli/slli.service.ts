import { Injectable, Logger } from '@nestjs/common';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';

@Injectable()
export class SessionManagerService {
  constructor(private readonly liftingcastService: LiftingcastService) {}
  private readonly logger = new Logger(SessionManagerService.name);

  private sessions = new Array<SessionDetails>();

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
  }
}

type SessionDetails = {
  liftingcastMeetID: string;
  liftingcastPlatformID: string;
  liftingcastPassword: string;
  singularAppToken: string;
};
