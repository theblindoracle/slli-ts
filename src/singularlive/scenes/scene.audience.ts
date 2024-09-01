import {
  SecondAttemptStringerWidget,
  ThirdAttemptStringerWidget,
} from '../compositions/audience/audience.attemptStringers';
import {
  BestBenchPayload,
  BestBenchWidget,
} from '../compositions/audience/audience.bestBench';
import { BestSquatWidget } from '../compositions/audience/audience.bestSquat';
import { BigNameWidget } from '../compositions/audience/audience.bigName';
import {
  LightInfractionPayload,
  LightsWidget,
} from '../compositions/audience/audience.lights';
import { MiddleLogoWidget } from '../compositions/audience/audience.middleLogo';
import { NameFieldWidget } from '../compositions/audience/audience.nameField';
import { NextLifterWidget } from '../compositions/audience/audience.nextLifter';
import { RootWidget } from '../compositions/audience/audience.root';
import { MiddleTimerWidget } from '../compositions/audience/audience.middleTimer';
import { WeightClassNumberWidget } from '../compositions/audience/audience.weightClassNumber';
import {
  Attempt1Widget,
  Attempt2Widget,
  Attempt3Widget,
} from '../compositions/audience/audience.attempt';
import {
  Attempt,
  ClockState,
  Lift,
  Lifter,
  MeetDocument,
  RefLights,
} from 'src/liftingcast/liftingcast.enteties';
import { UpdateControlAppContentDTO } from '../singularlive.dtos';
import {
  getBestLiftWeight,
  isRefDecisionGood,
} from 'src/liftingcast/liftingcast.utils';
import { delay } from '../singularlive.utils';
import { SingularliveService } from '../singularlive.service';
import { Record } from 'src/records/records.entity';
import {
  AttemptChangedEvent,
  ClockStateChangedEvent,
  CurrentAttemptUpdatedEvent,
  RefLightUpdatedEvent,
} from 'src/liftingcast/liftingcast.event';
import { Logger } from '@nestjs/common';
import { RecordsModel } from 'src/records/records.model';
import { RankingsModel } from 'src/rankings/rankings.model';
import { LiftingcastDivisionDecoder } from 'src/liftingcast/liftingcast.decoder';
import {
  AmericanRecordWidget,
  NationalRecordWidget,
  StateRecordWidget,
  WorldRecordWidget,
} from '../compositions/audience/audience.recrods';
import { StandingsSourceWidget } from '../compositions/audience/audience.standingsSource';
import { SquatStandingsWidget } from '../compositions/audience/audience.standings';
import { AttemptChangeComp } from '../compositions/audience/audience.attemptChange';

export class AudienceScene {
  private readonly logger = new Logger(AudienceScene.name);
  constructor(
    private readonly singularliveService: SingularliveService,
    private readonly recordsModel: RecordsModel,
    private readonly rankingsModel: RankingsModel,
    public controlAppToken: string,
    public meetID: string,
    public platformID: string,
  ) { }

  rootWidget = new RootWidget();

  middleTimerWidget = new MiddleTimerWidget();
  middleLogoWidget = new MiddleLogoWidget();

  secondAttemptStingerWidget = new SecondAttemptStringerWidget();
  thirdAttemptStingerWidget = new ThirdAttemptStringerWidget();

  bestSquatWidget = new BestSquatWidget();
  bestBenchWidet = new BestBenchWidget();
  attempt1Widget = new Attempt1Widget();
  attempt2Widget = new Attempt2Widget();
  attempt3Widget = new Attempt3Widget();

  lightsWidget = new LightsWidget();

  bigNameWidget = new BigNameWidget();
  nameFieldWidget = new NameFieldWidget();
  weightClassWidget = new WeightClassNumberWidget();
  nextLifterWidget = new NextLifterWidget();

  stateRecordWidget = new StateRecordWidget();
  americanRecordWidget = new AmericanRecordWidget();
  nationalRecordWidget = new NationalRecordWidget();
  worldRecordWidget = new WorldRecordWidget();

  standingsSourceWidget = new StandingsSourceWidget();

  attemptChangeComp = new AttemptChangeComp();

  private defaultLights: RefLights = {
    left: { decision: null },
    head: { decision: null },
    right: { decision: null },
  };

  lightState: RefLights = this.defaultLights;

  record: Record = null;

  async onClockStateChanged(e: ClockStateChangedEvent) {
    if (e.meetID !== this.meetID || e.platformID !== this.platformID) {
      return;
    }
    const { currentState, clockDuration } = e;
    await this.updateTimer(clockDuration / 1000, currentState as ClockState);
  }

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

  previousFlight = '';
  async onCurrentAttemptUpdated(event: CurrentAttemptUpdatedEvent) {
    if (event.meetID !== this.meetID || event.platformID !== this.platformID) {
      return;
    }
    // reset lights on attempt update
    this.lightState = this.defaultLights;
    this.record = null;

    const meetDocument = event.meetDocument;
    const platform = meetDocument.platforms.find(
      (platform) => platform.id === event.platformID,
    );

    if (!platform.currentAttempt) {
      this.logger.warn(
        `currentAttempt is null ${this.meetID + ':' + this.platformID}`,
      );
      //update standings
      const standingsSource: UpdateControlAppContentDTO = {
        subCompositionId: this.standingsSourceWidget.compID,
        payload: this.standingsSourceWidget.buildPayload(meetDocument),
      };
      await this.singularliveService.updateControlAppContent(
        this.controlAppToken,
        standingsSource,
      );
      return;
    }

    const currentLifter = meetDocument.lifters.find(
      (lifter) => lifter.id === platform.currentAttempt.lifter.id,
    );

    if (this.previousFlight !== currentLifter.flight) {
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
    //This isnt the right spot for this
    const divisions = currentLifter.divisions.map((lifterDivision) =>
      meetDocument.divisions.find(
        (division) => division.id === lifterDivision.divisionId,
      ),
    );

    const divisionNames = divisions.map(
      (division) =>
        new LiftingcastDivisionDecoder().decode(division.name).ageGroup,
    );

    this.logger.log(divisionNames);
    const weightClass = divisions[0].weightClasses.find(
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
      divisions[0].name,
      currentLifter.state,
      platform.currentAttempt.liftName,
      currentLift.weight,
      currentLifter.divisions[0].forecastedTotal,
    );
    this.logger.log('Lifter Record', this.record);

    const ranking = await this.rankingsModel.getLifterRanking(
      currentLifter.name,
      weightClass.name,
      divisions[0].name,
    );

    this.logger.log('Lifter Ranking', ranking);

    const equipmentLevel = new LiftingcastDivisionDecoder().decode(
      divisions[0].name,
    ).equipmentLevel;

    const nextLifters = platform.nextAttempts
      .map((attempt) => attempt.lifter.id)
      .map(
        (lifterId) =>
          meetDocument.lifters.find((lifter) => lifter.id === lifterId).name,
      );

    await this.playAttemptChange(
      currentLifter,
      divisionNames,
      weightClass.name,
      equipmentLevel,
      meetDocument.platforms.find((platform) => platform.id === this.platformID)
        .currentAttempt,
      nextLifters[0],
    );
  }

  async playLiftResult(refLights: RefLights) {
    const leftInfractionBarPayload: LightInfractionPayload =
      this.lightsWidget.buildLightInfractionPayload(refLights.left);
    const rightInfractionBarPayload: LightInfractionPayload =
      this.lightsWidget.buildLightInfractionPayload(refLights.right);
    const headInfractionBarPayload: LightInfractionPayload =
      this.lightsWidget.buildLightInfractionPayload(refLights.head);

    const compositionUpdates: UpdateControlAppContentDTO[] = [
      {
        subCompositionId: this.lightsWidget.lightsCompID,
        payload: this.lightsWidget.buildLightsPayload(refLights),
        state: 'In',
      },
      {
        subCompositionId: this.lightsWidget.leftLightInfractionCompId,
        payload: leftInfractionBarPayload,
      },
      {
        subCompositionId: this.lightsWidget.rightLightInfractionCompId,
        payload: rightInfractionBarPayload,
      },
      {
        subCompositionId: this.lightsWidget.headLightInfractionCompId,
        payload: headInfractionBarPayload,
      },
    ];

    const phase2Update: UpdateControlAppContentDTO[] = [
      {
        subCompositionId: this.lightsWidget.lightsCompID,
        state: 'Out',
      },
    ];

    const liftIsGood = this.isLiftGoodViaLights(this.lightState);
    if (liftIsGood && this.record) {
      let compID = '';
      switch (this.record.recordLevel) {
        case 'state':
          compID = this.stateRecordWidget.compID;
          break;
        case 'american':
          compID = this.americanRecordWidget.compID;
          break;
        case 'national':
          compID = this.nationalRecordWidget.compID;
          break;
        case 'world':
          compID = this.worldRecordWidget.compID;
          break;
        default:
          compID = '';
      }
      if (compID !== '') {
        compositionUpdates.push({
          subCompositionId: compID,
          state: 'In',
        });

        phase2Update.push({
          subCompositionId: compID,
          state: 'Out',
        });
      }
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

  private isLiftGoodViaLights(lightState: RefLights) {
    return isRefDecisionGood(lightState.left.decision)
      ? isRefDecisionGood(lightState.head.decision) ||
      isRefDecisionGood(lightState.right.decision)
      : isRefDecisionGood(lightState.head.decision) &&
      isRefDecisionGood(lightState.right.decision);
  }

  async playAttemptNumberChange(attemptNumber: string) {
    let compId = undefined;
    if (attemptNumber === '2') {
      compId = this.secondAttemptStingerWidget.compID;
    } else if (attemptNumber === '3') {
      compId = this.thirdAttemptStingerWidget.compID;
    }

    if (!compId) return;

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      { subCompositionId: compId, state: 'In' },
    );

    await delay(4000);

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      { subCompositionId: compId, state: 'Out' },
    );
  }

  async updateTimer(clockLength: number, clockState: ClockState) {
    if (clockState === 'initial') {
      const content: UpdateControlAppContentDTO[] = [
        {
          subCompositionId: this.middleTimerWidget.compID,
          state: 'Out',
          payload: this.middleTimerWidget.buildPayload(clockState, clockLength),
        },
        {
          subCompositionId: this.middleLogoWidget.compID,
          state: 'In',
        },
      ];

      await this.singularliveService.updateControlAppContent(
        this.controlAppToken,
        content,
      );
    } else {
      const content: UpdateControlAppContentDTO[] = [
        {
          subCompositionId: this.middleTimerWidget.compID,
          state: 'In',
          payload: this.middleTimerWidget.buildPayload(clockState, clockLength),
        },
        {
          subCompositionId: this.middleLogoWidget.compID,
          state: 'Out',
        },
      ];

      await this.singularliveService.updateControlAppContent(
        this.controlAppToken,
        content,
      );
    }
  }

  async playAttemptChange(
    currentLifter: Lifter,
    divisionNames: string[],
    weightClassName: string,
    equipmentLevel: string,
    currentAttempt: Attempt,
    nextLifter: string,
  ) {
    // playIn this.bigNameWidget.compID, weightClassNumberCompId
    // playOut bestSquatCompId, bestBenchCompId
    let lifts: Lift[];
    if (currentAttempt.liftName === 'squat') {
      lifts = currentLifter.lifts.squat;
    } else if (currentAttempt.liftName === 'bench') {
      lifts = currentLifter.lifts.bench;
    } else {
      lifts = currentLifter.lifts.deadlift;
    }
    const phase1Body: UpdateControlAppContentDTO[] = [
      {
        subCompositionName: this.rootWidget.compID,
        payload: {
          currentAttemptLiftName: currentAttempt.liftName,
          currentAttemptAttemptNumber: currentAttempt.attemptNumber,
          athleteName: currentLifter.name,
        },
      },
      {
        subCompositionId: this.bigNameWidget.compID,
        state: 'In',
      },
      {
        subCompositionId: this.weightClassWidget.compID,
        payload: this.weightClassWidget.buildPayload(
          currentLifter,
          divisionNames,
          equipmentLevel,
          weightClassName,
        ),
        state: 'In',
      },
      {
        subCompositionId: this.bestSquatWidget.compId,
        state: 'Out',
      },
      {
        subCompositionId: this.bestBenchWidet.compId,
        state: 'Out',
      },
      {
        subCompositionId: this.attempt1Widget.compID,
        state: 'In',
        payload: this.attempt1Widget.buildAttemptPayload(
          lifts[0],
          currentAttempt.attemptNumber === '1',
        ),
      },
      {
        subCompositionId: this.attempt2Widget.compID,
        state: 'In',
        payload: this.attempt2Widget.buildAttemptPayload(
          lifts[1],
          currentAttempt.attemptNumber === '2',
        ),
      },
      {
        subCompositionId: this.attempt3Widget.compID,
        state: 'In',
        payload: this.attempt3Widget.buildAttemptPayload(
          lifts[2],
          currentAttempt.attemptNumber === '3',
        ),
      },
    ];
    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      phase1Body,
    );
    // hold 2 seconds
    await delay(4000);

    // playOut this.bigNameWidget.compID

    // playIn nameFieldOption2CompId, bestSquatCompId, bestBenchCompId, next lifter
    const phase2Body: UpdateControlAppContentDTO[] = [
      { subCompositionId: this.bigNameWidget.compID, state: 'Out' },
      {
        subCompositionId: this.nameFieldWidget.compID,
        state: 'In',
      },
      {
        subCompositionId: this.nextLifterWidget.compId,
        payload: {
          nextLifterName: nextLifter,
        },
        state: 'In',
      },
    ];

    if (
      currentAttempt.liftName === 'bench' ||
      currentAttempt.liftName === 'dead'
    ) {
      phase2Body.push({
        subCompositionId: this.bestSquatWidget.compId,
        payload: {
          bestSQNum: getBestLiftWeight(currentLifter.lifts.squat),
        },
        state: 'In',
      });
    }

    if (currentAttempt.liftName === 'dead') {
      phase2Body.push({
        subCompositionId: this.bestBenchWidet.compId,
        payload: {
          bestBPNum: getBestLiftWeight(currentLifter.lifts.bench),
        } as BestBenchPayload,
        state: 'In',
      });
    }

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      phase2Body,
    );

    // hold 3 seconds
    await delay(4000);
    // playOut nextLifterCompId
    const phase3Body: UpdateControlAppContentDTO[] = [
      {
        subCompositionId: this.nextLifterWidget.compId,
        state: 'Out',
      },
    ];
    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      phase3Body,
    );
  }

  squatStandingsWidget = new SquatStandingsWidget();
  async playStandingsGraphic(meetDocument: MeetDocument) {
    // update source

    const standingsSource: UpdateControlAppContentDTO = {
      subCompositionId: this.standingsSourceWidget.compID,
      payload: this.standingsSourceWidget.buildPayload(meetDocument),
    };

    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      standingsSource,
    );
    //play in overlay
    await this.singularliveService.updateControlAppContent(
      this.controlAppToken,
      {
        subCompositionId: this.squatStandingsWidget.compID,
        payload: { lastUpdate: new Date() },
        state: 'In',
      },
    );
  }

  async onAttemptChanged(e: AttemptChangedEvent) {
    await this.singularliveService.updateControlAppContent(this.controlAppToken,
      {
        subCompositionId: this.attemptChangeComp.compID,
        state: "In"
      })

    await delay(3000)

    await this.singularliveService.updateControlAppContent(this.controlAppToken,
      {
        subCompositionId: this.attemptChangeComp.compID,
        state: "Out"
      })

    await this.onCurrentAttemptUpdated(e)
  }

}
