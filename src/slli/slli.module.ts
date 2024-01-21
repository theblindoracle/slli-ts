import { Module } from '@nestjs/common';
import { SessionManagerService } from './slli.service';
import { SlliController } from './slli.controller';
import { LiftingcastModule } from 'src/liftingcast/liftingcast.module';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { LiftingcastEndpoint } from 'src/liftingcast/liftingcast.endpoint';
import { HttpModule } from '@nestjs/axios';
import { SingularliveModule } from 'src/singularlive/singularlive.module';
import { SingularliveService } from 'src/singularlive/singularlive.service';
import { MainScene } from 'src/singularlive/scenes/singularlive.mainscene';
import { SceneManagerService } from 'src/singularlive/singularlive.scenemanager';

@Module({
  imports: [LiftingcastModule, HttpModule, SingularliveModule],
  controllers: [SlliController],
  providers: [
    SessionManagerService,
    LiftingcastService,
    LiftingcastEndpoint,
    SingularliveService,
    MainScene,
    SceneManagerService,
  ],
})
export class SlliModule {}
