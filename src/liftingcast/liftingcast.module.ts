import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';
import { LiftingcastEndpoint } from './liftingcast.endpoint';
import { LiftingcastController } from './liftingcast.controller';
import { LiftingcastEventListeners } from './liftingcast.listeners';
import { LiftingcastSessionService } from './liftingcast.sessionService';
import { LiftingcastWebsocketService } from './liftingcast.ws';

@Module({
  imports: [HttpModule],
  providers: [
    LiftingcastEndpoint,
    LiftingcastService,
    LiftingcastEventListeners,
    LiftingcastSessionService,
    LiftingcastWebsocketService
  ],
  controllers: [LiftingcastController],
  exports: [
    LiftingcastService,
    LiftingcastEndpoint,
    LiftingcastEventListeners,
    LiftingcastSessionService,
  ],
})
export class LiftingcastModule { }
