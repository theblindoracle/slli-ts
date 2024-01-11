import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  MeetDocumentUpdatedEvent,
} from './liftingcast.event';
import { Injectable, Logger } from '@nestjs/common';
import { LiftingcastService } from './liftingcast.service';

@Injectable()
export class CurrentAttemptUpdatedListener {
  private readonly logger = new Logger(CurrentAttemptUpdatedListener.name);

  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(LiftingcastEvents.CurrentAttemptUpdated)
  async handleCurrentAttemptUpdated(event: CurrentAttemptUpdatedEvent) {
    this.logger.log(event);

    const response = await this.liftingcastService.getMeetData(event.meetId);

    this.eventEmitter.emit(
      LiftingcastEvents.MeetDocumentUpdated,
      new MeetDocumentUpdatedEvent({ meetDocument: response }),
    );
  }
}

@Injectable()
export class MeetDocumentUpdatedListener {
  private readonly logger = new Logger(MeetDocumentUpdatedListener.name);

  @OnEvent(LiftingcastEvents.MeetDocumentUpdated)
  handleMeetDecumentUpdatedListener(event: MeetDocumentUpdatedEvent) {
    this.logger.log(event);
  }
}
