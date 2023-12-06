import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PlatformUpdatedEvent,
  RefLightUpdatedEvent,
} from './liftingcast.event';

@Injectable()
export class LiftingcastEventListener {
  @OnEvent('liftingcast.platformUpdated')
  handlePlatformUpdatedEvent(event: PlatformUpdatedEvent) {
    console.log('liftingcast.platformUpdate', event);
  }

  @OnEvent('liftingcast.lightUpdated')
  handleLightUpdated(event: RefLightUpdatedEvent) {
    // console.log('liftingcast.lightUpdated', event);
  }
}
