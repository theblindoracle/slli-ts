import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';
import { LiftingcastEndpoint } from './liftingcast.endpoint';
import { LiftingcastController } from './liftingcast.controller';
import { LiftingcastEventListeners } from './liftingcast.listeners';

@Module({
  imports: [HttpModule],
  providers: [
    LiftingcastEndpoint,
    LiftingcastService,
    LiftingcastEventListeners,
  ],
  controllers: [LiftingcastController],
  exports: [LiftingcastService, LiftingcastEndpoint, LiftingcastEventListeners],
})
export class LiftingcastModule {}
