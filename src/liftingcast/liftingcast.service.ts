import {Injectable} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import {PlatformUpdatedEvent, RefLightUpdatedEvent} from './liftingcast.event';
import {EventEmitter2} from '@nestjs/event-emitter';
import {LiftingcastEndpoint} from './liftingcast.endpoint';
import {MeetDocument} from './liftingcast.enteties';

@Injectable()
export class LiftingcastService {
  private seqNumber = '0';
  private platformId = 'ppjiq0g8i70b';
  private meetId = 'mqky3v477ua5';
  private password = 'test';
  private isSessionActive = false;
  private abortController: AbortController;

  constructor(
    private liftingcastEndpoint: LiftingcastEndpoint,
    private eventEmitter: EventEmitter2,
  ) {}

  start() {
    this.isSessionActive = true;
    this.abortController = new AbortController();
    this.getPlatformDocument();
  }

  stop() {
    if (this.isSessionActive) {
      this.isSessionActive = false;
      this.abortController.abort();
    }
  }

  async getMeetData(): Promise<MeetDocument> {
    const response = await firstValueFrom(
      this.liftingcastEndpoint.getMeet(this.meetId),
    );

    return this.transformMeetData(response.data);
  }

  private transformMeetData(json) {
    const lifters = Object.values(json.lifters).map((lcLifter: any) => {
      const squats = Object.values(lcLifter.lifts.squat);
      const benches = Object.values(lcLifter.lifts.bench);
      const deadlifts = Object.values(lcLifter.lifts.dead);

      return {
        ...lcLifter,
        lifts: {
          squat: squats,
          bench: benches,
          deadlift: deadlifts,
        },
      };
    });

    const platforms = Object.values(json.platforms);
    const divisions = Object.values(json.divisions).map((division: any) => {
      const weightClasses = Object.entries(division.weightClasses).map(
        (entry) => {
          return {id: entry[0], ...(entry[1] as any)};
        },
      );
      return {...division, weightClasses};
    });

    return {...json, lifters, platforms, divisions};
  }
  private async getPlatformDocument() {
    try {
      const response = await firstValueFrom(
        this.liftingcastEndpoint.getPlatformDocument(
          this.platformId,
          this.meetId,
          this.password,
          this.seqNumber,
          this.abortController,
        ),
      );

      const data = response.data;
      this.seqNumber = data.last_seq;

      const platformDoc = data.results.find(
        (result) => result.doc._id === this.platformId,
      )?.doc;
      if (platformDoc) {
        const platformUpdatedEvent = new PlatformUpdatedEvent();
        platformUpdatedEvent.payload = platformDoc;
        this.eventEmitter.emit(
          'liftingcast.platformUpdated',
          platformUpdatedEvent,
        );
      }

      const lightDocs = data.results
        .filter((res) => res.doc._id.startsWith('r'))
        .map((res) => res.doc);

      lightDocs.forEach((lightDoc) => {
        const event = new RefLightUpdatedEvent();
        event.payload = lightDoc;
        this.eventEmitter.emit('liftingcast.lightUpdated', event);
      });

      await this.getPlatformDocument();
    } catch (error) {
      if (error.code === 'ECONNRESET') {
        console.count('restarting longpoll');
        await this.getPlatformDocument();
      }
    }
  }
}
