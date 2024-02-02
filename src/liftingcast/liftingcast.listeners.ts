import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  MeetDocumentUpdatedEvent,
} from './liftingcast.event';
import { Injectable, Logger } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';

@Injectable()
export class LiftingcastEventListeners {
  private readonly logger = new Logger(LiftingcastEventListeners.name);

  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // @OnEvent(LiftingcastEvents.CurrentAttemptUpdated, { async: true })
  // async handleCurrentAttemptUpdated(event: CurrentAttemptUpdatedEvent) {
  //   this.logger.log(LiftingcastEvents.CurrentAttemptUpdated);
  //   this.logger.log(`${event.meetID}:${event.platformID}`);
  //
  //   const response = await this.liftingcastService.getMeetData(event.meetID);
  //
  //   this.eventEmitter.emit(
  //     LiftingcastEvents.MeetDocumentUpdated,
  //     new MeetDocumentUpdatedEvent({ meetDocument: response }),
  //   );
  // }

  // @OnEvent(LiftingcastEvents.MeetDocumentUpdated)
  // handleMeetDecumentUpdatedListener(event: MeetDocumentUpdatedEvent) {
  //   this.logger.log(LiftingcastEvents.MeetDocumentUpdated);
  // }
}
