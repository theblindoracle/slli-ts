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
    this.logger.log('sceneType', typeof sceneType);
    this.logger.log(sceneType === SceneType.Main);
    if (sceneType === SceneType.Main) {
      const mainScene = this.createMainScene(
        controlAppToken,
        meetID,
        platformID,
      );
      this.scenes.push(mainScene);
      this.logger.log('Main scene created', mainScene);
    } else if (sceneType === SceneType.Audience) {
      const audienceScene = this.createAudienceScene(
        controlAppToken,
        meetID,
        platformID,
      );
      this.scenes.push(audienceScene);
      this.logger.log('Audience scene created', audienceScene);
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
      (e: CurrentAttemptUpdatedEvent) => {
        if (
          e.meetID !== mainScene.meetID &&
          e.platformID !== mainScene.platformID
        ) {
          this.logger.warn(
            `MainScene: ${e.meetID} does not equal ${mainScene.meetID} and ${e.platformID} does not equal ${mainScene.platformID}`,
          );
          return;
        }
        mainScene.onCurrentAttemptUpdated(e);
      },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.ClockStateChanged,
      (e: ClockStateChangedEvent) => {
        if (e.platformID !== mainScene.platformID) {
          this.logger.warn(
            `AudienceScene: ${e.platformID} does not equal ${mainScene.platformID}`,
          );
          return;
        }
        mainScene.onClockStateChanged(e);
      },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.RefLightUpdatedEvent,
      (e: RefLightUpdatedEvent) => {
        if (e.platformID !== mainScene.platformID) {
          this.logger.warn(
            `AudienceScene: ${e.platformID} does not equal ${mainScene.platformID}`,
          );
          return;
        }
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
      (e: CurrentAttemptUpdatedEvent) => {
        if (
          e.meetID !== audienceScene.meetID &&
          e.platformID !== audienceScene.platformID
        ) {
          this.logger.warn(
            `AudienceScene: ${e.meetID} does not equal ${audienceScene.meetID} and ${e.platformID} does not equal ${audienceScene.platformID}`,
          );
          return;
        }
        audienceScene.onCurrentAttemptUpdated(e);
      },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.ClockStateChanged,
      (e: ClockStateChangedEvent) => {
        if (e.platformID !== audienceScene.platformID) {
          this.logger.warn(
            `AudienceScene: ${e.platformID} does not equal ${audienceScene.platformID}`,
          );
          return;
        }
        audienceScene.onClockStateChanged(e);
      },
    );

    this.eventEmmiter.on(
      LiftingcastEvents.RefLightUpdatedEvent,
      (e: RefLightUpdatedEvent) => {
        if (e.platformID !== audienceScene.platformID) {
          this.logger.warn(
            `AudienceScene: ${e.platformID} does not equal ${audienceScene.platformID}`,
          );
          return;
        }

        audienceScene.onRefLightsUpdated(e);
      },
    );
    return audienceScene;
  }
}
