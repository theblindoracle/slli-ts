import { Module } from '@nestjs/common';
import { SessionManagerService } from './slli.service';
import { SlliController } from './slli.controller';
import { LiftingcastModule } from 'src/liftingcast/liftingcast.module';
import { HttpModule } from '@nestjs/axios';
import { SingularliveModule } from 'src/singularlive/singularlive.module';
import { UsaplModule } from 'src/usapl/usapl.module';
import { SlliPreMeetService } from './premeet/premeet.service';
import { RecordsModule } from 'src/records/records.module';
import { RankingsModule } from 'src/rankings/rankings.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [
    LiftingcastModule,
    HttpModule,
    SingularliveModule,
    UsaplModule,
    RecordsModule,
    RankingsModule,
    SessionModule,
  ],
  controllers: [SlliController],
  providers: [SessionManagerService, SlliPreMeetService],
})
export class SlliModule {}
