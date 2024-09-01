import { Injectable, Logger } from "@nestjs/common";
import { LCErrorEvent, LCLatencyUpdatedEvent, LCMeetUpdatedEvent, LC_EVENTS } from "./liftingcast.ws";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { AttemptChangedEvent, ClockStateChangedEvent, CurrentAttemptUpdatedEvent, LiftingcastEvents, RefLightUpdatedEvent } from "./liftingcast.event";
import { Lifter, MeetDocument, Platform } from "./liftingcast.enteties";
import { MeetApiResponse } from "./liftingcast.types";


@Injectable()
export class LiftingcastInterceptor {
  private readonly logger = new Logger(LiftingcastInterceptor.name)
  private previousMeetState: MeetApiResponse


  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {
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
      if (this.previousMeetState) {

        const previousPlatformState = Object.values(this.previousMeetState.platforms).find(prev => prev.id === platform.id)


        if (platform.currentAttempt.id !== previousPlatformState.currentAttempt.id) {
          this.logger.log(LiftingcastEvents.CurrentAttemptUpdated)
          this.eventEmitter.emit(LiftingcastEvents.CurrentAttemptUpdated, new CurrentAttemptUpdatedEvent({
            meetID: event.meetID,
            platformID: platform.id,
            meetDocument: meetData
          }))
        }

        if (JSON.stringify(platform.refLights.head) !== JSON.stringify(previousPlatformState.refLights.head)) {
          this.logger.log(LiftingcastEvents.RefLightUpdatedEvent)
          this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
            meetID: event.meetID,
            platformID: platform.id,
            position: 'head',
            decision: platform.refLights.head.decision,
            cards: platform.refLights.head.cards,
          }))
        } else if (JSON.stringify(platform.refLights.left) !== JSON.stringify(previousPlatformState.refLights.left)) {
          this.logger.log(LiftingcastEvents.RefLightUpdatedEvent)
          this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
            meetID: event.meetID,
            platformID: platform.id,
            position: 'left',
            decision: platform.refLights.left.decision,
            cards: platform.refLights.left.cards,
          }))
        } else if (JSON.stringify(platform.refLights.right) !== JSON.stringify(previousPlatformState.refLights.right)) {
          this.logger.log(LiftingcastEvents.RefLightUpdatedEvent)
          this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
            meetID: event.meetID,
            platformID: platform.id,
            position: 'right',
            decision: platform.refLights.right.decision,
            cards: platform.refLights.right.cards,
          }))
        }

        if (platform.clockState !== previousPlatformState.clockState ||
          platform.clockTimerLength !== previousPlatformState.clockTimerLength) {
          this.logger.log(LiftingcastEvents.ClockStateChanged)
          this.eventEmitter.emit(LiftingcastEvents.ClockStateChanged, new ClockStateChangedEvent({
            meetID: event.meetID,
            platformID: platform.id,
            previousState: previousPlatformState.clockState,
            currentState: platform.clockState,
            clockDuration: platform.clockTimerLength,
          }))
        }

        //check if attempt has changed

        const previousLifter = Object.values(this.previousMeetState.lifters).find(lifter => lifter.id === previousPlatformState.currentAttempt.lifter.id)
        const currentLifter = Object.values(event.meetDoc.lifters).find(lifter => lifter.id === platform.currentAttempt.lifter.id)

        if (currentLifter.id === previousLifter.id && JSON.stringify(previousLifter.lifts) !== JSON.stringify(currentLifter.lifts)) {
          this.logger.log(LiftingcastEvents.AttemptChanged)
          this.eventEmitter.emit(LiftingcastEvents.AttemptChanged, new AttemptChangedEvent({
            meetID: event.meetID,
            platformID: platform.id,
            meetDocument: meetData
          }))
        }
      } else {

        this.eventEmitter.emit(LiftingcastEvents.CurrentAttemptUpdated, new CurrentAttemptUpdatedEvent({
          meetID: event.meetID,
          platformID: platform.id,
          meetDocument: meetData
        }))

        this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
          meetID: event.meetID,
          platformID: platform.id,
          position: 'head',
          decision: platform.refLights.head.decision,
          cards: platform.refLights.head.cards
        }))

        this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
          meetID: event.meetID,
          platformID: platform.id,
          position: 'left',
          decision: platform.refLights.left.decision,
          cards: platform.refLights.left.cards,
        }))

        this.eventEmitter.emit(LiftingcastEvents.RefLightUpdatedEvent, new RefLightUpdatedEvent({
          meetID: event.meetID,
          platformID: platform.id,
          position: 'right',
          decision: platform.refLights.right.decision,
          cards: platform.refLights.right.cards,
        }))

        this.eventEmitter.emit(LiftingcastEvents.ClockStateChanged, new ClockStateChangedEvent({
          meetID: event.meetID,
          platformID: platform.id,
          previousState: "",
          currentState: platform.clockState,
          clockDuration: platform.clockTimerLength,
        }))
      }
    })

    this.previousMeetState = event.meetDoc
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
