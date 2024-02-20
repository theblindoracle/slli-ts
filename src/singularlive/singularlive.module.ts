import { Module } from '@nestjs/common';
import { SingularliveService } from './singularlive.service';
import { HttpModule } from '@nestjs/axios';
import { LiftingcastModule } from 'src/liftingcast/liftingcast.module';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { LiftingcastEndpoint } from 'src/liftingcast/liftingcast.endpoint';
import { MainScene } from './scenes/singularlive.mainscene';
import { SceneManagerService } from './singularlive.scenemanager';
import { RecordsService } from 'src/records/records.service';
import { RecordsModule } from 'src/records/records.module';
import { Record } from 'src/records/records.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    HttpModule,
    LiftingcastModule,
    RecordsModule,
    TypeOrmModule.forFeature([Record]),
  ],
  providers: [
    SingularliveService,
    RecordsService,
    LiftingcastService,
    LiftingcastEndpoint,
    MainScene,
    SceneManagerService,
  ],
  controllers: [],
})
export class SingularliveModule {}
