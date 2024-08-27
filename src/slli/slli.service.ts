import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LiftingcastSessionService } from 'src/liftingcast/liftingcast.sessionService';
import { SessionService } from 'src/session/session.service';
import { SceneManagerService } from 'src/singularlive/singularlive.scenemanager';

@Injectable()
export class SessionManagerService implements OnModuleInit {
  constructor(
    private readonly liftingcastSessionService: LiftingcastSessionService,
    private readonly sceneManagerService: SceneManagerService,
    private readonly sessionService: SessionService,
  ) { }
  private readonly logger = new Logger(SessionManagerService.name);

  async onModuleInit() {
    const sessions = await this.sessionService.findAll();

    for (const session of sessions) {
      // this.liftingcastSessionService.startSession(
      //   session.lcMeetID,
      //   session.lcPlatformID,
      //   session.lcPassword,
      // );
      //
      this.sceneManagerService.addScene(
        session.slControlAppToken,
        session.sceneType,
        session.lcMeetID,
        session.lcPlatformID,
      );
    }
  }

  async stopSession(id: number) {
    const session = await this.sessionService.findOneBy({ id });

    if (session === null) {
      this.logger.log(`Session with id ${id} was not found`);
      return;
    }
    const lcSessionCount = (await this.sessionService.findAll()).filter(
      (sess) =>
        sess.lcMeetID === session.lcMeetID &&
        sess.lcPlatformID === session.lcPlatformID,
    ).length;
    if (lcSessionCount <= 1) {
      this.liftingcastSessionService.stopSession(
        session.lcMeetID,
        session.lcPlatformID,
      );
    }

    this.sceneManagerService.removeScene(session.slControlAppToken);

    this.sessionService.remove(session.id);
  }

  async startSession(
    liftingcastMeetID: string,
    liftingcastPlatformID: string,
    liftingcastPassword: string,
    singularAppToken: string,
    sceneType: number,
  ) {
    await this.sessionService.save({
      lcMeetID: liftingcastMeetID,
      lcPlatformID: liftingcastPlatformID,
      lcPassword: liftingcastPassword,
      slControlAppToken: singularAppToken,
      sceneType: sceneType,
    });

    // this.liftingcastSessionService.startSession(
    //   liftingcastMeetID,
    //   liftingcastPlatformID,
    //   liftingcastPassword,
    // );

    this.sceneManagerService.addScene(
      singularAppToken,
      sceneType,
      liftingcastMeetID,
      liftingcastPlatformID,
    );
  }
}
