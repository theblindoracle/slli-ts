import { Injectable, Logger } from "@nestjs/common";
import { LCErrorEvent, LCLatencyUpdatedEvent, LCMeetUpdatedEvent, LC_EVENTS } from "./liftingcast.ws";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ClockStateChangedEvent, CurrentAttemptUpdatedEvent, LiftingcastEvents, RefLightUpdatedEvent } from "./liftingcast.event";
import { ConfigService } from "@nestjs/config";
import { Lift, Lifter, MeetDocument, Platform } from "./liftingcast.enteties";
import { MeetApiResponse } from "./liftingcast.types";


@Injectable()
export class LiftingcastInterceptor {
  private readonly logger = new Logger(LiftingcastInterceptor.name)
  private meetId: string;
  private meetState: MeetApiResponse


  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService
  ) {

    this.meetId = this.configService.getOrThrow("LC_MEET_ID")
    this.meetId = this.configService.getOrThrow("LC_MEET_ID")
  }


  @OnEvent(LC_EVENTS.MEET_UPDATED)
  onMeetUpdate(event: LCMeetUpdatedEvent) {
    this.logger.log(LC_EVENTS.MEET_UPDATED)

    if (!event.meetDoc.platforms) {
      this.logger.warn("platforms is undefined")
      return
    }

    const meetData = this.transformMeetData(event.meetDoc)

    Object.values(event.meetDoc.platforms).forEach(platform => {
      if (this.meetState) {

        const previousState = Object.values(this.meetState.platforms).find(prev => prev.id === platform.id)

        if (platform.currentAttempt.id !== previousState.currentAttempt.id) {
          this.logger.log(LiftingcastEvents.CurrentAttemptUpdated)
          this.eventEmitter.emit(LiftingcastEvents.CurrentAttemptUpdated, new CurrentAttemptUpdatedEvent({
            meetID: this.meetId,
            platformID: platform.id,
            meetDocument: meetData
          }))
        }
        if (JSON.stringify(platform.refLights.head) !== JSON.stringify(previousState.refLights.head)) {
          this.logger.log(LiftingcastEvents.RefLightUpdatedEvent)
          this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
            meetID: this.meetId,
            platformID: platform.id,
            position: 'head',
            decision: platform.refLights.head.decision,
            cards: platform.refLights.head.cards,
          }))
        } else if (JSON.stringify(platform.refLights.left) !== JSON.stringify(previousState.refLights.left)) {
          this.logger.log(LiftingcastEvents.RefLightUpdatedEvent)
          this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
            meetID: this.meetId,
            platformID: platform.id,
            position: 'left',
            decision: platform.refLights.left.decision,
            cards: platform.refLights.left.cards,
          }))
        } else if (JSON.stringify(platform.refLights.right) !== JSON.stringify(previousState.refLights.right)) {
          this.logger.log(LiftingcastEvents.RefLightUpdatedEvent)
          this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
            meetID: this.meetId,
            platformID: platform.id,
            position: 'right',
            decision: platform.refLights.right.decision,
            cards: platform.refLights.right.cards,
          }))
        }

        if (platform.clockState !== previousState.clockState ||
          platform.clockTimerLength !== previousState.clockTimerLength) {
          this.logger.log(LiftingcastEvents.ClockStateChanged)
          this.eventEmitter.emit(LiftingcastEvents.ClockStateChanged, new ClockStateChangedEvent({
            meetID: this.meetId,
            platformID: platform.id,
            previousState: previousState.clockState,
            currentState: platform.clockState,
            clockDuration: platform.clockTimerLength,
          }))
        }
      } else {

        this.eventEmitter.emit(LiftingcastEvents.CurrentAttemptUpdated, new CurrentAttemptUpdatedEvent({
          meetID: this.meetId,
          platformID: platform.id,
          meetDocument: meetData
        }))

        this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
          meetID: this.meetId,
          platformID: platform.id,
          position: 'head',
          decision: platform.refLights.head.decision,
          cards: platform.refLights.head.cards
        }))

        this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
          meetID: this.meetId,
          platformID: platform.id,
          position: 'left',
          decision: platform.refLights.left.decision,
          cards: platform.refLights.left.cards,
        }))

        this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
          meetID: this.meetId,
          platformID: platform.id,
          position: 'right',
          decision: platform.refLights.right.decision,
          cards: platform.refLights.right.cards,
        }))

        this.eventEmitter.emit(LiftingcastEvents.ClockStateChanged, new ClockStateChangedEvent({
          meetID: this.meetId,
          platformID: platform.id,
          previousState: "",
          currentState: platform.clockState,
          clockDuration: platform.clockTimerLength,
        }))
      }
    })

    this.meetState = event.meetDoc
  }

  @OnEvent(LC_EVENTS.LATENCY_UPDATED)
  onLatencyUpdate(event: LCLatencyUpdatedEvent) {
    this.logger.log(LC_EVENTS.LATENCY_UPDATED, event)

  }

  @OnEvent(LC_EVENTS.ERROR)
  onError(event: LCErrorEvent) {
    this.logger.error(event)

  }

  private transformMeetData(json: MeetApiResponse): MeetDocument {
    const lifters: Lifter[] = Object.values(json.lifters).map((lcLifter) => {
      const squats = Object.values(lcLifter.lifts.squat);
      const benches = Object.values(lcLifter.lifts.bench);
      const deadlifts = Object.values(lcLifter.lifts.dead);

      const divisions = lcLifter.divisions.filter(
        (division) => division.divisionId,
      );

      return {
        ...lcLifter,
        session: lcLifter.session,
        divisions,
        lifts: {
          squat: squats,
          bench: benches,
          deadlift: deadlifts,
        },
      };
    });

    const platforms: Platform[] = Object.values(json.platforms).map(value => ({
      id: value.id,
      name: value.name,
      nextAttempts: value.nextAttempts,
      barAndCollarWeight: value.barAndCollarsWeight,
      currentAttempt: value.currentAttempt
    }));

    const divisions = Object.values(json.divisions).map((division: any) => {
      const weightClasses = Object.entries(division.weightClasses).map(
        (entry) => {
          return { id: entry[0], ...(entry[1] as any) };
        },
      );
      return { ...division, weightClasses };
    });

    return { ...json, lifters, platforms, divisions }
  }
}
