import { Injectable, Logger } from '@nestjs/common';
import { MainScene } from './scenes/singularlive.mainscene';
import { SingularliveService } from './singularlive.service';
import {
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  RefLightUpdatedEvent,
} from 'src/liftingcast/liftingcast.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecordsModel } from 'src/records/records.model';
import { RankingsModel } from 'src/rankings/rankings.model';
import { AudienceScene } from './scenes/scene.audience';

export enum SceneType {
  Main,
  Audience,
}

@Injectable()
export class SceneManagerService {
  private readonly logger = new Logger(SceneManagerService.name);
  constructor(
    private readonly singularliveService: SingularliveService,
    private readonly recordModel: RecordsModel,
    private readonly rankingsModel: RankingsModel,
    private readonly eventEmmiter: EventEmitter2,
  ) {}

  private readonly scenes = [];

  addScene(
    controlAppToken: string,
    sceneType: SceneType,
    meetID: string,
    platformID: string,
  ) {
    if (sceneType === SceneType.Main) {
      const mainScene = this.createMainScene(
        controlAppToken,
        meetID,
        platformID,
      );
      this.scenes.push(mainScene);

      this.logger.log('Main scene created');
      this.logger.log(mainScene.meetID);
      this.logger.log(mainScene.platformID);
    } else if (sceneType === SceneType.Audience) {
      const audienceScene = this.createAudienceScene(
        controlAppToken,
        meetID,
        platformID,
      );
      this.scenes.push(audienceScene);
      this.logger.log('Audience scene created');
      this.logger.log(audienceScene.meetID);
      this.logger.log(audienceScene.platformID);
    }
  }

  createMainScene(controlAppToken: string, meetID: string, platformID: string) {
    const mainScene = new MainScene(
      this.singularliveService,
      this.recordModel,
      this.rankingsModel,
    ).init(meetID, platformID, controlAppToken);

    this.eventEmmiter.on(
      LiftingcastEvents.CurrentAttemptUpdated,
      async (e: CurrentAttemptUpdatedEvent) => {
        await mainScene.onCurrentAttemptUpdated(e);
      },
      { async: true },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.ClockStateChanged,
      (e: ClockStateChangedEvent) => {
        mainScene.onClockStateChanged(e);
      },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.RefLightUpdatedEvent,
      (e: RefLightUpdatedEvent) => {
        mainScene.onRefLightsUpdated(e);
      },
    );
    return mainScene;
  }
  createAudienceScene(
    controlAppToken: string,
    meetID: string,
    platformID: string,
  ) {
    const audienceScene = new AudienceScene(
      this.singularliveService,
      this.recordModel,
      this.rankingsModel,
      controlAppToken,
      meetID,
      platformID,
    );

    this.eventEmmiter.on(
      LiftingcastEvents.CurrentAttemptUpdated,
      async (e: CurrentAttemptUpdatedEvent) => {
        await audienceScene.onCurrentAttemptUpdated(e);
      },
      { async: true },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.ClockStateChanged,
      (e: ClockStateChangedEvent) => {
        if (e.platformID !== audienceScene.platformID) {
          return;
        }
        audienceScene.onClockStateChanged(e);
      },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.RefLightUpdatedEvent,
      (e: RefLightUpdatedEvent) => {
        audienceScene.onRefLightsUpdated(e);
      },
    );
    return audienceScene;
  }
}
