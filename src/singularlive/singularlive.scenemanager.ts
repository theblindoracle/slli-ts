import { Injectable } from '@nestjs/common';
import { Scene } from './scenes/singularlive.scene';
import { MainScene } from './scenes/singularlive.mainscene';
import { SingularliveService } from './singularlive.service';
import {
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
} from 'src/liftingcast/liftingcast.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SceneManagerService {
  constructor(
    private readonly singularliveService: SingularliveService,
    private readonly eventEmmiter: EventEmitter2,
  ) {}
  private readonly scenes = new Array<MainScene>();

  addScene(controlAppToken: string, meetID: string, platformID: string) {
    const mainScene = this.createMainScene(controlAppToken, meetID, platformID);

    this.scenes.push(mainScene);
  }

  createMainScene(controlAppToken: string, meetID: string, platformID: string) {
    const mainScene = new MainScene().init(controlAppToken, meetID, platformID);

    return mainScene;
  }

  // handleOnCurrentAttemptUpdated(e: CurrentAttemptUpdatedEvent) {
  //   const platfromScenes = this.scenes.filter(
  //     (scene) => scene.meetID === e.meetID && scene.platformID === e.meetID,
  //   );
  // }
}
