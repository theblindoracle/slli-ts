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

@Injectable()
export class SceneManagerService {
  private readonly logger = new Logger(SceneManagerService.name);
  constructor(
    private readonly singularliveService: SingularliveService,
    private readonly recordModel: RecordsModel,
    private readonly eventEmmiter: EventEmitter2,
  ) {}

  private readonly scenes = new Array<MainScene>();

  async addScene(controlAppToken: string, meetID: string, platformID: string) {
    const mainScene = this.createMainScene(controlAppToken, meetID, platformID);

    this.scenes.push(mainScene);
  }

  createMainScene(controlAppToken: string, meetID: string, platformID: string) {
    const mainScene = new MainScene(
      this.singularliveService,
      this.recordModel,
    ).init(controlAppToken, meetID, platformID);

    this.eventEmmiter.on(
      LiftingcastEvents.CurrentAttemptUpdated,
      (event: CurrentAttemptUpdatedEvent) => {
        mainScene.onCurrentAttemptUpdated(event);
      },
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
        // if (e.platformID !== platformID) {
        //   this.logger.warn(
        //     `${e.platformID} does not equal ${mainScene.platformID}`,
        //   );
        //   return;
        // }

        mainScene.onRefLightsUpdated(e);
      },
    );
    return mainScene;
  }
}
