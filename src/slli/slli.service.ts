import {Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {
  LiftingcastEvents,
  RefLightUpdatedEvent,
} from 'src/liftingcast/liftingcast.event';
import {LiftingcastService} from 'src/liftingcast/liftingcast.service';

@Injectable()
export class SlliService {
  constructor(private readonly liftingcastService: LiftingcastService) {}
  private readonly logger = new Logger(SlliService.name);

  async startSession(meetId: string, platformId: string, meetPassword: string) {
    this.liftingcastService.listenForDocumentChanges(
      meetId,
      platformId,
      meetPassword,
    );
  }

  @OnEvent(LiftingcastEvents.RefLightUpdatedEvent)
  onRefLightUpdated(event: RefLightUpdatedEvent) {
    console.log(event);
  }
}

type SlliSession = {
  lcMeetId: string;
  lcPlatformId: string;
  meetPassword: string;
  singularControlAppToken: string;
};
