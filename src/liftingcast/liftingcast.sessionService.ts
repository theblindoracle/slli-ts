import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LiftingcastService } from './liftingcast.service';
import { LiftingcastSession } from './liftingcast.session';

@Injectable()
export class LiftingcastSessionService {
  private readonly logger = new Logger(LiftingcastSessionService.name);
  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  private readonly sessions = new Array<LiftingcastSession>(); // next time, use a map

  startSession(meetID: string, platformID: string, password: string) {
    if (
      this.sessions.some(
        (session) =>
          session.meetID === meetID && session.platformID === platformID,
      )
    ) {
      this.logger.log(`session already exists for ${meetID}:${platformID}`);
      return;
    }

    const session = new LiftingcastSession(
      this.liftingcastService,
      this.eventEmitter,
      meetID,
      platformID,
      password,
    );

    session.startPoll();

    this.sessions.push(session);

    this.logger.log(`created session for ${meetID}:${platformID}`);
  }

  stopSession(meetID: string, platformID: string) {
    const idx = this.sessions.findIndex(
      (value) => value.meetID === meetID && value.platformID === platformID,
    );

    if (idx !== -1) {
      this.sessions.splice(idx, 1);
    }
  }
}
