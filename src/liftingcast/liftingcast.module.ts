import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';
import { LiftingcastEndpoint } from './liftingcast.endpoint';
import { LiftingcastController } from './liftingcast.controller';
import { LiftingcastSessionService } from './liftingcast.sessionService';
import { LiftingcastWebsocketService } from './liftingcast.ws';
import { LiftingcastInterceptor } from './liftingcast.interceptor';

@Module({
  imports: [HttpModule],
  providers: [
    LiftingcastEndpoint,
    LiftingcastService,
    LiftingcastSessionService,
    LiftingcastWebsocketService,
    LiftingcastInterceptor
  ],
  controllers: [LiftingcastController],
  exports: [
    LiftingcastService,
    LiftingcastEndpoint,
    LiftingcastSessionService,
  ],
})
export class LiftingcastModule { }
