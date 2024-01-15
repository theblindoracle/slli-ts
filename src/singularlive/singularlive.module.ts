import { Module } from '@nestjs/common';
import { SingularliveService } from './singularlive.service';
import { HttpModule } from '@nestjs/axios';
import { SingularliveController } from './singularlive.controller';
import { LiftingcastModule } from 'src/liftingcast/liftingcast.module';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { LiftingcastEndpoint } from 'src/liftingcast/liftingcast.endpoint';

@Module({
  imports: [HttpModule, LiftingcastModule],
  providers: [SingularliveService, LiftingcastService, LiftingcastEndpoint],
  controllers: [SingularliveController],
})
export class SingularliveModule {}
