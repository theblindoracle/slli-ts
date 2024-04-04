import {
  Attempt,
  ClockState,
  Lifter,
  RefLights,
} from 'src/liftingcast/liftingcast.enteties';
import { SingularliveService } from '../singularlive.service';
import {
  getBestLiftWeight,
  isRefDecisionGood,
} from 'src/liftingcast/liftingcast.utils';
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
import { delay } from '../singularlive.utils';
import {
  SecondAttemptStingerComp,
  ThirdAttemptStingerComp,
} from '../compositions/attemptStinger';
import { RecordAttemptComp } from '../compositions/recordAttempt';
import { SuccessfulRecordComp } from '../compositions/successfulRecord';
import { RecordsModel } from 'src/records/records.model';
import { Record } from 'src/records/records.entity';
import { RankingsModel } from 'src/rankings/rankings.model';
import { Ranking } from 'src/rankings/rankings.entity';
import { ExpMainAthleteBottomBar } from '../compositions/expMainAthleteBottomBar';
import { LiftingcastDivisionDecoder } from 'src/liftingcast/liftingcast.decoder';
import { StandingsSourceWidget } from '../compositions/standingsSource';

export class MainScene {
  private readonly logger = new Logger(MainScene.name);

  constructor(
    private readonly singularliveService: SingularliveService,
    private readonly recordsModel: RecordsModel,
    private readonly rankingsModel: RankingsModel,
  ) {}

  meetID: string;
  platformID: string;
  private controlAppToken: string;

  private readonly mainAthleteBottomBarComp = new ExpMainAthleteBottomBar();
  private readonly lightsComp = new LightsComp();
  private readonly shortTimerComp = new ShortTimerComp();
  private readonly nextLiftersComp = new NextLiftersComp();
  private readonly secondAttemptStingerComp = new SecondAttemptStingerComp();
  private readonly thirdAttemptStingerComp = new ThirdAttemptStingerComp();
  private readonly recordAttemptComp = new RecordAttemptComp();
  private readonly successfulRecordComp = new SuccessfulRecordComp();

  standingsSourceWidget = new StandingsSourceWidget();

  init(meetID: string, platformID: string, controlAppToken: string) {
    this.meetID = meetID;
    this.platformID = platformID;
    this.controlAppToken = controlAppToken;
    return this;
  }

  async onClockStateChanged(e: ClockStateChangedEvent) {
    if (e.meetID !== this.meetID || e.platformID !== this.platformID) {
      return;
    }
    const { currentState, clockDuration } = e;
    await this.updateTimer(clockDuration / 1000, currentState as ClockState);
  }

  async updateTimer(clockLength: number, clockState: ClockState) {
    const payload = this.shortTimerComp.buildPayload(clockState, clockLength);

    const content: UpdateControlAppContentDTO = {
      subCompositionId: this.shortTimerComp.shortTimerCompID,
      payload: payload,
    };

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
    if (e.meetID !== this.meetID || e.platformID !== this.platformID) {
      return;
    }
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
      await this.playLiftResult(this.lightState);
    }
  }

  private isLiftGoodViaLights(lightState: RefLights) {
    return isRefDecisionGood(lightState.left.decision)
      ? isRefDecisionGood(lightState.head.decision) ||
          isRefDecisionGood(lightState.right.decision)
      : isRefDecisionGood(lightState.head.decision) &&
          isRefDecisionGood(lightState.right.decision);
  }

  async playLiftResult(refLights: RefLights) {
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

    const phase2Update: UpdateControlAppContentDTO[] = [];

    //if there is a record and the lift is good, play successfulRecord
    const liftIsGood = this.isLiftGoodViaLights(this.lightState);
    if (liftIsGood && this.record) {
      compositionUpdates.push({
        subCompositionId: this.successfulRecordComp.compID,
        payload: this.successfulRecordComp.buildPayload(
          this.record.recordLevel,
        ),
        state: 'In',
      });

      phase2Update.push({
        subCompositionId: this.successfulRecordComp.compID,
        state: 'Out',
      });
    }

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      compositionUpdates,
    );

    await delay(5000);

    if (phase2Update.length > 0) {
      await this.singularliveService.updateControlAppContent(
        this.controlAppToken,
        phase2Update,
      );
    }
  }

  record: Record = null;
  previousFlight = null;
  async onCurrentAttemptUpdated(event: CurrentAttemptUpdatedEvent) {
    // reset lights on attempt update
    if (event.meetID !== this.meetID || event.platformID !== this.platformID) {
      return;
    }

    this.lightState = this.initialLights;
    this.record = null;

    if (event.platformID !== this.platformID && event.meetID !== this.meetID)
      return;

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

    if (
      this.previousFlight !== currentLifter.flight ||
      platform.currentAttempt === null
    ) {
      this.previousFlight = currentLifter.flight;
      //update standings
      const standingsSource: UpdateControlAppContentDTO = {
        subCompositionId: this.standingsSourceWidget.compID,
        payload: this.standingsSourceWidget.buildPayload(meetDocument),
      };

      await this.singularliveService.updateControlAppContent(
        this.controlAppToken,
        standingsSource,
      );
    }
    const division = meetDocument.divisions.find(
      (division) => division.id === currentLifter.divisions[0].divisionId,
    );

    const weightClass = division.weightClasses.find(
      (weightClass) =>
        weightClass.id === currentLifter.divisions[0].weightClassId,
    );

    const currentLift = [
      ...currentLifter.lifts.squat,
      ...currentLifter.lifts.bench,
      ...currentLifter.lifts.deadlift,
    ].find((lift) => lift.id === platform.currentAttempt.id);

    this.record = await this.recordsModel.getBestDivisionRecord(
      weightClass.name,
      division.name,
      currentLifter.state,
      platform.currentAttempt.liftName,
      currentLift.weight,
      currentLifter.divisions[0].forecastedTotal,
    );

    const ranking = await this.rankingsModel.getLifterRanking(
      currentLifter.name,
      weightClass.name,
      division.name,
    );

    this.logger.log('Lifter Ranking', ranking);

    const nextLifters = platform.nextAttempts
      .map((attempt) => attempt.lifter.id)
      .map(
        (lifterId) =>
          meetDocument.lifters.find((lifter) => lifter.id === lifterId).name,
      );

    await this.playAttemptChange(
      currentLifter,
      meetDocument.platforms.find((platform) => platform.id === this.platformID)
        .currentAttempt,
      division.name,
      weightClass.name,
      nextLifters,
      this.record,
      ranking,
    );
  }

  private nextLifterCounter = 3;
  private previousAttemptNumber = '0';

  async playAttemptChange(
    currentLifter: Lifter,
    currentAttempt: Attempt,
    divisionName: string,
    weightClassName: string,
    nextLifters: string[],
    currentAttemptRecord: Record,
    currentLifterRanking?: Ranking,
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
        currentLifterRanking,
        currentAttempt,
      ),
    });

    const decoded = new LiftingcastDivisionDecoder().decode(divisionName);
    phase1Updates.push({
      subCompositionId: this.mainAthleteBottomBarComp.weightClassCompID,
      payload: this.mainAthleteBottomBarComp.buildWeightClassPayload(
        decoded.ageGroup,
        weightClassName,
      ),
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
      if (currentAttempt.attemptNumber === '2') {
        phase1Updates.push({
          subCompositionId: this.secondAttemptStingerComp.compID,
          state: 'In',
        });
        phase2Updates.push({
          subCompositionId: this.secondAttemptStingerComp.compID,
          state: 'Out',
        });
      }

      if (currentAttempt.attemptNumber === '3') {
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

    //play record attempt if applicable
    if (currentAttemptRecord) {
      phase1Updates.push({
        subCompositionId: this.recordAttemptComp.compID,
        payload: this.recordAttemptComp.buildPayload(currentAttemptRecord),
        state: 'In',
      });

      phase2Updates.push({
        subCompositionId: this.recordAttemptComp.compID,
        state: 'Out',
      });
    }

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      phase1Updates,
    );

    await delay(7000);
    if (phase2Updates.length > 0) {
      await this.singularliveService.updateControlAppContent(
        this.controlAppToken,
        phase2Updates,
      );
    }
  }
}
