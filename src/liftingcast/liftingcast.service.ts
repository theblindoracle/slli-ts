import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom, of } from 'rxjs';
import {
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  LiftingcastEvents,
  RefLightUpdatedEvent,
} from './liftingcast.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LiftingcastEndpoint } from './liftingcast.endpoint';
import { ClockState, MeetDocument } from './liftingcast.enteties';
import { AxiosResponse, isAxiosError } from 'axios';

@Injectable()
export class LiftingcastService {
  private readonly logger = new Logger(LiftingcastService.name);
  private abortController: AbortController = new AbortController();

  constructor(
    private liftingcastEndpoint: LiftingcastEndpoint,
    private eventEmitter: EventEmitter2,
  ) { }

  async getMeetData(meetId: string): Promise<MeetDocument> {
    const response = await firstValueFrom(
      this.liftingcastEndpoint.getMeet(meetId),
    );

    const data = this.transformMeetData(response.data);
    return data;
  }

  private transformMeetData(json) {
    const lifters = Object.values(json.lifters).map((lcLifter: any) => {
      const squats = Object.values(lcLifter.lifts.squat);
      const benches = Object.values(lcLifter.lifts.bench);
      const deadlifts = Object.values(lcLifter.lifts.dead);

      const divisions = lcLifter.divisions.filter(
        (division) => division.divisionId,
      );

      return {
        ...lcLifter,
        divisions,
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
          return { id: entry[0], ...(entry[1] as any) };
        },
      );
      return { ...division, weightClasses };
    });

    return { ...json, lifters, platforms, divisions };
  }

  async listenForDocumentChanges(
    meetId: string,
    platformId: string,
    password: string,
    sequenceNumber: string = '0',
  ) {
    return firstValueFrom(
      this.liftingcastEndpoint
        .getPlatformDocument(
          platformId,
          meetId,
          password,
          sequenceNumber,
          this.abortController,
        )
        .pipe(
          catchError((error) => {
            if (isAxiosError(error) && error.message === 'aborted') {
              return of({
                config: error.response?.config,
                headers: error.response?.headers,
                status: error.response?.status,
                statusText: error.response?.statusText,
                request: error.request,
              } as AxiosResponse);
            }
            throw error;
          }),
        ),
    );
  }
}
