import { Module } from '@nestjs/common';
import { SingularliveService } from './singularlive.service';
import { HttpModule } from '@nestjs/axios';
import { LiftingcastModule } from 'src/liftingcast/liftingcast.module';
import { SceneManagerService } from './singularlive.scenemanager';
import { RecordsModule } from 'src/records/records.module';
import { RankingsModule } from 'src/rankings/rankings.module';

@Module({
  imports: [HttpModule, LiftingcastModule, RecordsModule, RankingsModule],
  providers: [SingularliveService, SceneManagerService],
  exports: [SceneManagerService, SingularliveService],
})
export class SingularliveModule {}
