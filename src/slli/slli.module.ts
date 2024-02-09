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
import { UsaplModule } from 'src/usapl/usapl.module';
import { SlliPreMeetService } from './premeet/premeet.service';
import { UsaplService } from 'src/usapl/usapl.service';
import { RecordsService } from 'src/records/records.service';
import { RecordsModule } from 'src/records/records.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/records/records.entity';

@Module({
  imports: [
    LiftingcastModule,
    HttpModule,
    SingularliveModule,
    UsaplModule,
    RecordsModule,
    TypeOrmModule.forFeature([Record]),
  ],
  controllers: [SlliController],
  providers: [
    SessionManagerService,
    LiftingcastService,
    UsaplService,
    RecordsService,
    LiftingcastEndpoint,
    SlliPreMeetService,
    SingularliveService,
    MainScene,
    SceneManagerService,
  ],
})
export class SlliModule {}
