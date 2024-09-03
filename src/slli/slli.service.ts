import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LiftingcastWebsocketService } from 'src/liftingcast/liftingcast.ws';
import { SessionService } from 'src/session/session.service';
import { SceneManagerService } from 'src/singularlive/singularlive.scenemanager';

@Injectable()
export class SessionManagerService implements OnModuleInit {
  constructor(
    private readonly sceneManagerService: SceneManagerService,
    private readonly sessionService: SessionService,
    private readonly liftingcastWebsocketService: LiftingcastWebsocketService
  ) { }
  private readonly logger = new Logger(SessionManagerService.name);

  async onModuleInit() {
    const sessions = await this.sessionService.findBy({ isActive: true })

    for (const session of sessions) {
      this.liftingcastWebsocketService.startSession(session.lcMeetID, session.lcPassword)

      this.sceneManagerService.addScene(
        session.slControlAppToken,
        session.sceneType,
        session.lcMeetID,
        session.lcPlatformID,
      );
    }
  }

  async deleteSession(id: number) {
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
      this.liftingcastWebsocketService.stopSession(
        session.lcMeetID,
      );
    }

    this.sceneManagerService.removeScene(session.slControlAppToken);

    await this.sessionService.remove(session.id);
  }

  async createSession(liftingcastMeetID: string,
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
      isActive: true,
      sceneType: sceneType,
    });
  }

  async startSession(sessionID: number) {

    const session = await this.sessionService.findOneBy({ id: sessionID });

    if (!session) {
      this.logger.warn(`No session found with id: ${sessionID}`)
      return
    }

    if (session.isActive) {
      this.logger.warn(`session is already active: ${sessionID}`)
    }

    this.liftingcastWebsocketService.startSession(session.lcMeetID, session.lcPassword)

    this.sceneManagerService.addScene(
      session.slControlAppToken,
      session.sceneType,
      session.lcMeetID,
      session.lcPlatformID,
    );

    await this.sessionService.save({ ...session, isActive: true })
  }

  async stopSession(sessionID: number) {

    const session = await this.sessionService.findOneBy({ id: sessionID });

    if (session === null) {
      this.logger.log(`Session with id ${sessionID} was not found`);
      return;
    }

    if (!session.isActive) {
      this.logger.warn(`session is already inactive: ${sessionID}`)
    }

    this.liftingcastWebsocketService.stopSession(session.lcMeetID)

    this.sceneManagerService.removeScene(
      session.slControlAppToken,
    );

    await this.sessionService.save({ ...session, isActive: false })
  }
}
