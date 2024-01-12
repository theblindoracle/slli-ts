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
  // private seqNumber = '0';
  // private platformId = 'ppjiq0g8i70b';
  // private meetId = 'mqky3v477ua5';
  // private password = 'test';
  // private isSessionActive = false;
  private abortController: AbortController = new AbortController();

  constructor(
    private liftingcastEndpoint: LiftingcastEndpoint,
    private eventEmitter: EventEmitter2,
  ) {}

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
  ) {
    let seqNumber = '0';
    let previousClockState: ClockState = 'initial';
    let previousClockTimerLength: number;
    let previousAttemptId: string;

    // while (true) {
    const response = await firstValueFrom(
      this.liftingcastEndpoint
        .getPlatformDocument(
          platformId,
          meetId,
          password,
          seqNumber,
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

    if (response.status !== HttpStatus.OK) {
      // break loop and retry call if call times out or is aborted
      // continue;
    }

    const data = response.data;
    seqNumber = data.last_seq;

    const platformDoc = data.results.find(
      (result) => result.doc._id === platformId,
    )?.doc;
    if (platformDoc) {
      if (platformDoc.currentAttemptId !== previousAttemptId) {
        this.eventEmitter.emit(
          LiftingcastEvents.CurrentAttemptUpdated,
          new CurrentAttemptUpdatedEvent({
            meetId: meetId,
            currentAttemptId: platformDoc.currentAttemptId,
          }),
        );
      }

      if (
        platformDoc.clockState !== previousClockState ||
        previousClockTimerLength !== platformDoc.clockTimerLength
      ) {
        this.eventEmitter.emit(
          LiftingcastEvents.ClockStateChanged,
          new ClockStateChangedEvent({
            previousState: previousClockState,
            currentState: platformDoc.clockState,
            clockDuration: platformDoc.clockTimerLength,
          }),
        );

        previousClockState = platformDoc.clockState;
        previousClockTimerLength = platformDoc.clockTimerLength;
      }
    }

    const lightDocs = data.results
      .filter((res) => res.doc._id.startsWith('r'))
      .map((res) => res.doc);

    lightDocs.forEach((lightDoc) => {
      this.eventEmitter.emit(
        LiftingcastEvents.RefLightUpdatedEvent,
        new RefLightUpdatedEvent({ payload: lightDoc }),
      );
    });
    // }
  }
}
