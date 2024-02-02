import {
  Attempt,
  ClockState,
  Lifter,
  RefLights,
} from 'src/liftingcast/liftingcast.enteties';
import { SingularliveService } from '../singularlive.service';
import { getBestLiftWeight } from 'src/liftingcast/liftingcast.utils';
import { UpdateControlAppContentDTO } from '../singularlive.dtos';
import { Logger } from '@nestjs/common';
import {
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  RefLightUpdatedEvent,
} from 'src/liftingcast/liftingcast.event';
import { MainAthleteBottomBar } from '../compositions/mainAthleteBottomBar';
import { LightInfractionPayload, LightsComp } from '../compositions/lights';
import { ShortTimerComp } from '../compositions/shortTimer';
import { NextLiftersComp } from '../compositions/nextLifters';
import { WeightClassComp } from '../compositions/weightClass';
import { delay } from '../singularlive.utils';
import {
  SecondAttemptStingerComp,
  ThirdAttemptStingerComp,
} from '../compositions/attemptStinger';

export class MainScene {
  private readonly logger = new Logger(MainScene.name);

  constructor(private readonly singularliveService: SingularliveService) {}

  meetID: string;
  platformID: string;
  private controlAppToken: string;

  private readonly mainAthleteBottomBarComp = new MainAthleteBottomBar();
  private readonly lightsComp = new LightsComp();
  private readonly shortTimerComp = new ShortTimerComp();
  private readonly nextLiftersComp = new NextLiftersComp();
  private readonly weightClassComp = new WeightClassComp();
  private readonly secondAttemptStingerComp = new SecondAttemptStingerComp();
  private readonly thirdAttemptStingerComp = new ThirdAttemptStingerComp();

  init(meetID: string, platformID: string, controlAppToken: string) {
    this.meetID = meetID;
    this.platformID = platformID;
    this.controlAppToken = controlAppToken;
    return this;
  }

  async onClockStateChanged(e: ClockStateChangedEvent) {
    const { currentState, clockDuration } = e;
    await this.updateTimer(clockDuration / 1000, currentState as ClockState);
  }

  async updateTimer(clockLength: number, clockState: ClockState) {
    const payload = this.shortTimerComp.buildPayload(clockState, clockLength);

    const content: UpdateControlAppContentDTO = {
      subCompositionId: this.shortTimerComp.shortTimerCompID,
      payload: payload,
    };

    this.logger.debug(`ClockPayload`, payload);

    this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      content,
    );
  }

  private initialLights: RefLights = {
    left: { decision: null },
    head: { decision: null },
    right: { decision: null },
  };

  lightState: RefLights = this.initialLights;

  async onRefLightsUpdated(e: RefLightUpdatedEvent) {
    if (e.position === 'left') {
      this.lightState.left.decision = e.decision;
      this.lightState.left.cards = e.cards;
    } else if (e.position === 'head') {
      this.lightState.head.decision = e.decision;
      this.lightState.head.cards = e.cards;
    } else if (e.position === 'right') {
      this.lightState.right.decision = e.decision;
      this.lightState.right.cards = e.cards;
    }

    if (
      this.lightState.head.decision &&
      this.lightState.left.decision &&
      this.lightState.right.decision
    ) {
      await this.updateLights(this.lightState);
    }

    this.lightState = this.initialLights;
  }

  async updateLights(refLights: RefLights) {
    const leftInfractionBarPayload: LightInfractionPayload =
      this.lightsComp.buildLightInfractionPayload(refLights.left);
    const rightInfractionBarPayload: LightInfractionPayload =
      this.lightsComp.buildLightInfractionPayload(refLights.right);
    const headInfractionBarPayload: LightInfractionPayload =
      this.lightsComp.buildLightInfractionPayload(refLights.head);

    const compositionUpdates: UpdateControlAppContentDTO[] = [
      {
        subCompositionId: this.lightsComp.lightsCompID,
        payload: this.lightsComp.buildLightsPayload(refLights),
      },
      {
        subCompositionId: this.lightsComp.leftLightInfractionCompId,
        payload: leftInfractionBarPayload,
      },
      {
        subCompositionId: this.lightsComp.rightLightInfractionCompId,
        payload: rightInfractionBarPayload,
      },
      {
        subCompositionId: this.lightsComp.headLightInfractionCompId,
        payload: headInfractionBarPayload,
      },
    ];

    this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      compositionUpdates,
    );
  }

  async onCurrentAttemptUpdated(event: CurrentAttemptUpdatedEvent) {
    if (event.platformID !== this.platformID && event.meetID !== this.meetID)
      return;

    this.logger.log(
      `CurrentAttemptUpdated in MainScene ${event.meetID} ${event.platformID}`,
    );

    const meetDocument = event.meetDocument;
    const platform = meetDocument.platforms.find(
      (platform) => platform.id === event.platformID,
    );

    if (!platform.currentAttempt) {
      this.logger.warn(
        `currentAttempt is null ${this.meetID + ':' + this.platformID}`,
      );
      return;
    }

    const currentLifter = meetDocument.lifters.find(
      (lifter) => lifter.id === platform.currentAttempt.lifter.id,
    );

    const division = meetDocument.divisions.find(
      (division) => division.id === currentLifter.divisions[0].divisionId,
    );

    const weightClass = division.weightClasses.find(
      (weightClass) =>
        weightClass.id === currentLifter.divisions[0].weightClassId,
    );

    const nextLifters = platform.nextAttempts
      .map((attempt) => attempt.lifter.id)
      .map(
        (lifterId) =>
          meetDocument.lifters.find((lifter) => lifter.id === lifterId).name,
      );

    await this.playAttemptChange(
      currentLifter,
      meetDocument.platforms[0].currentAttempt,
      `${division.name} - ${weightClass.name} `,
      nextLifters,
    );
  }

  private nextLifterCounter = 3;
  private previousAttemptNumber = 0;

  async playAttemptChange(
    currentLifter: Lifter,
    currentAttempt: Attempt,
    divisionName: string,
    nextLifters: string[],
  ) {
    const phase1Updates: UpdateControlAppContentDTO[] = [];
    const phase2Updates: UpdateControlAppContentDTO[] = [];

    if (currentAttempt.liftName === 'squat') {
      phase1Updates.push({
        subCompositionId: this.mainAthleteBottomBarComp.squatCompID,
        payload: this.mainAthleteBottomBarComp.buildSquatPayload(
          currentLifter.lifts.squat,
        ),
      });
    } else if (currentAttempt.liftName === 'bench') {
      phase1Updates.push({
        subCompositionId: this.mainAthleteBottomBarComp.benchCompID,
        payload: this.mainAthleteBottomBarComp.buildBenchPayload(
          currentLifter.lifts.bench,
          getBestLiftWeight(currentLifter.lifts.squat),
        ),
      });
    } else {
      phase1Updates.push({
        subCompositionId: this.mainAthleteBottomBarComp.deadliftCompID,
        payload: this.mainAthleteBottomBarComp.buildDeadliftPayload(
          currentLifter.lifts.deadlift,
          getBestLiftWeight(currentLifter.lifts.squat),
          getBestLiftWeight(currentLifter.lifts.bench),
        ),
      });
    }

    phase1Updates.push({
      subCompositionId:
        this.mainAthleteBottomBarComp.mainAthleteBottomBarCompID,
      payload: this.mainAthleteBottomBarComp.buildMainAtleteBottomBarPayload(
        currentLifter,
        currentAttempt,
      ),
    });
    phase1Updates.push({
      subCompositionId: this.weightClassComp.compID,
      payload: { classTitle: divisionName },
      state: 'In',
    });

    phase2Updates.push({
      subCompositionId: this.weightClassComp.compID,
      state: 'Out',
    });

    if (this.nextLifterCounter === 3) {
      phase1Updates.push({
        subCompositionId: this.nextLiftersComp.compID,
        payload: this.nextLiftersComp.buildPayload(nextLifters),
        state: 'In',
      });

      this.nextLifterCounter = 0;

      phase2Updates.push({
        subCompositionId: this.nextLiftersComp.compID,
        state: 'Out',
      });
    }
    this.nextLifterCounter++;

    if (this.previousAttemptNumber !== currentAttempt.attemptNumber) {
      if (currentAttempt.attemptNumber === 2) {
        phase1Updates.push({
          subCompositionId: this.secondAttemptStingerComp.compID,
          state: 'In',
        });
        phase2Updates.push({
          subCompositionId: this.secondAttemptStingerComp.compID,
          state: 'Out',
        });
      }

      if (currentAttempt.attemptNumber === 3) {
        phase1Updates.push({
          subCompositionId: this.thirdAttemptStingerComp.compID,
          state: 'In',
        });
        phase2Updates.push({
          subCompositionId: this.thirdAttemptStingerComp.compID,
          state: 'Out',
        });
      }

      this.previousAttemptNumber = currentAttempt.attemptNumber;
    }

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      phase1Updates,
    );

    await delay(3000);

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      phase2Updates,
    );
  }
}
