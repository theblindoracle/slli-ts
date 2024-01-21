import { Module } from '@nestjs/common';
import { SingularliveService } from './singularlive.service';
import { HttpModule } from '@nestjs/axios';
import { LiftingcastModule } from 'src/liftingcast/liftingcast.module';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { LiftingcastEndpoint } from 'src/liftingcast/liftingcast.endpoint';
import { MainScene } from './scenes/singularlive.mainscene';
import { SceneManagerService } from './singularlive.scenemanager';

@Module({
  imports: [HttpModule, LiftingcastModule],
  providers: [
    SingularliveService,
    LiftingcastService,
    LiftingcastEndpoint,
    MainScene,
    SceneManagerService,
  ],
  controllers: [],
})
export class SingularliveModule {}
