import {
  Attempt,
  Lift,
  Lifter,
  RefLightDecision,
  RefLights,
} from 'src/liftingcast/liftingcast.enteties';
import {
  BenchPayload,
  BottomBarPayload,
  DeadliftPayload,
  LightInfractionPayload,
  LightsPayload,
  SquatPayload,
} from './singularlive.payloads';
import { SingularliveService } from './singularlive.service';
import {
  getBestLiftWeight,
  isLiftGood,
  isRefDecisionGood,
} from 'src/liftingcast/liftingcast.utils';
import { colors } from './singularlive.constants';
import { UpdateControlAppContentDTO } from './singularlive.dtos';

export class MainScene {
  constructor(
    private readonly appControlService: SingularliveService,
    private controlAppToken: string,
  ) {}

  async updateLights(refLights: RefLights) {
    const lightPayload: LightsPayload = {
      leftJudgeDecision: isRefDecisionGood(refLights.left.decision),
      headJudgeDecision: isRefDecisionGood(refLights.head.decision),
      rightJudgeDecision: isRefDecisionGood(refLights.right.decision),
      lastUpdate: new Date(),
    };

    const leftInfractionBarPayload: LightInfractionPayload =
      this.buildLightInfractionPayload(refLights.left);
    const rightInfractionBarPayload: LightInfractionPayload =
      this.buildLightInfractionPayload(refLights.right);
    const headInfractionBarPayload: LightInfractionPayload =
      this.buildLightInfractionPayload(refLights.head);

    const compositionUpdates: UpdateControlAppContentDTO[] = [
      {
        subcompositionId: lightsComposition.subcompositionId,
        payload: lightPayload,
      },
      {
        subcompositionId: leftLightInfractionCompId,
        payload: leftInfractionBarPayload,
      },
      {
        subcompositionId: rightLightInfractionCompId,
        payload: rightInfractionBarPayload,
      },
      {
        subcompositionId: headLightInfractionCompId,
        payload: headInfractionBarPayload,
      },
    ];

    this.appControlService.updateControlAppContent(
      this.controlAppToken,
      compositionUpdates,
    );
  }

  async playAttemptChange(currentLifter: Lifter, currentAttempt: Attempt) {
    const payload: Partial<BottomBarPayload> = {};
    const compositionUpdates: UpdateControlAppContentDTO[] = [];

    payload.athleteName = currentLifter.name;

    if (currentAttempt.liftName === 'squat') {
      payload.isSquatActive = true;
      payload.isBenchActive = false;
      payload.isDeadliftActive = false;

      compositionUpdates.push({
        subcompositionId: squatComposition.subcompositionId,
        payload: this.buildSquatPayload(currentLifter.lifts.squat),
      });
    } else if (currentAttempt.liftName === 'bench') {
      payload.isSquatActive = false;
      payload.isBenchActive = true;
      payload.isDeadliftActive = false;

      compositionUpdates.push({
        subcompositionId: benchComposition.subcompositionId,
        payload: this.buildBenchPayload(
          currentLifter.lifts.bench,
          getBestLiftWeight(currentLifter.lifts.squat),
        ),
      });
    } else {
      payload.isSquatActive = false;
      payload.isBenchActive = false;
      payload.isDeadliftActive = true;

      compositionUpdates.push({
        subcompositionId: deadliftComposition.subcompositionId,
        payload: this.buildDeadliftPayload(
          currentLifter.lifts.deadlift,
          getBestLiftWeight(currentLifter.lifts.squat),
          getBestLiftWeight(currentLifter.lifts.bench),
        ),
      });
    }

    if (currentAttempt.attemptNumber === 1) {
      payload.attempt1Active = true;
      payload.attempt2Active = false;
      payload.attempt3Active = false;
    } else if (currentAttempt.attemptNumber === 2) {
      payload.attempt1Active = false;
      payload.attempt2Active = true;
      payload.attempt3Active = false;
    } else if (currentAttempt.attemptNumber === 3) {
      payload.attempt1Active = false;
      payload.attempt2Active = false;
      payload.attempt3Active = true;
    } else {
      payload.attempt1Active = false;
      payload.attempt2Active = false;
      payload.attempt3Active = false;
    }

    compositionUpdates.push({
      subcompositionId: bottomBarComposition.subcompositionId,
      payload: payload,
    });
    await this.appControlService.updateControlAppContent(
      this.controlAppToken,
      compositionUpdates,
    );
  }

  buildSquatPayload = (attempts: Lift[]) => {
    const payload: SquatPayload = {
      squat1: '-',
      squat1Color: colors.mainOverlays.lift.future,
      squat2: '-',
      squat2Color: colors.mainOverlays.lift.future,
      squat3: '-',
      squat3Color: colors.mainOverlays.lift.future,
    };

    if (!isValueNullOrEmptyString(attempts[0].weight)) {
      payload.squat1 = attempts[0].weight;
    }
    payload.squat1Color = getLiftTextColor(attempts[0]);

    if (!isValueNullOrEmptyString(attempts[1].weight)) {
      payload.squat2 = attempts[1].weight;
    }
    payload.squat2Color = getLiftTextColor(attempts[1]);

    if (!isValueNullOrEmptyString(attempts[2].weight)) {
      payload.squat3 = attempts[2].weight;
    }
    payload.squat3Color = getLiftTextColor(attempts[2]);

    return payload;
  };

  buildBenchPayload = (benchLifts: Lift[], bestSquatWeight: number) => {
    const payload: BenchPayload = {
      bestSquat: '-',
      bench1: '-',
      bench1Color: colors.mainOverlays.lift.future,
      bench2: '-',
      bench2Color: colors.mainOverlays.lift.future,
      bench3: '-',
      bench3Color: colors.mainOverlays.lift.future,
    };

    payload.bestSquat = bestSquatWeight;

    if (!isValueNullOrEmptyString(benchLifts[0].weight)) {
      payload.bench1 = benchLifts[0].weight;
    }
    payload.bench1Color = getLiftTextColor(benchLifts[0]);

    if (!isValueNullOrEmptyString(benchLifts[1].weight)) {
      payload.bench2 = benchLifts[1].weight;
    }
    payload.bench2Color = getLiftTextColor(benchLifts[1]);

    if (!isValueNullOrEmptyString(benchLifts[2].weight)) {
      payload.bench3 = benchLifts[2].weight;
    }
    payload.bench3Color = getLiftTextColor(benchLifts[2]);

    return payload;
  };

  buildDeadliftPayload = (
    deadliftLifts: Lift[],
    bestSquatWeight: number,
    bestBenchWeight: number,
  ) => {
    const payload: DeadliftPayload = {
      bestSquat: '-',
      bestBench: '-',
      deadlift1: '-',
      deadlift1Color: colors.mainOverlays.lift.future,
      deadlift2: '-',
      deadlift2Color: colors.mainOverlays.lift.future,
      deadlift3: '-',
      deadlift3Color: colors.mainOverlays.lift.future,
    };

    payload.bestSquat = bestSquatWeight;
    payload.bestBench = bestBenchWeight;

    if (!isValueNullOrEmptyString(deadliftLifts[0].weight)) {
      payload.deadlift1 = deadliftLifts[0].weight;
    }
    payload.deadlift1Color = getLiftTextColor(deadliftLifts[0]);

    if (!isValueNullOrEmptyString(deadliftLifts[1].weight)) {
      payload.deadlift2 = deadliftLifts[1].weight;
    }
    payload.deadlift2Color = getLiftTextColor(deadliftLifts[1]);

    if (!isValueNullOrEmptyString(deadliftLifts[2].weight)) {
      payload.deadlift3 = deadliftLifts[2].weight;
    }
    payload.deadlift3Color = getLiftTextColor(deadliftLifts[2]);

    return payload;
  };

  buildLightInfractionPayload(refLightState: RefLightDecision) {
    const payload = {
      infractionFullBarColor: colors.liftInfactions.noInfaction,
      infractionBarRightColor: colors.liftInfactions.noInfaction,
      infractionBarLeftColor: colors.liftInfactions.noInfaction,
    };

    if (
      isRefDecisionGood(refLightState.decision) ||
      refLightState.cards === null
    ) {
      return payload;
    }
    const infractionColors = [];

    if (refLightState.cards.red === true) {
      infractionColors.push(colors.liftInfactions.red);
    }
    if (refLightState.cards.blue === true) {
      infractionColors.push(colors.liftInfactions.blue);
    }
    if (refLightState.cards.yellow === true) {
      infractionColors.push(colors.liftInfactions.yellow);
    }

    if (infractionColors.length === 1) {
      payload.infractionFullBarColor = infractionColors.pop();
    } else if (infractionColors.length === 2) {
      payload.infractionBarRightColor = infractionColors.pop();
      payload.infractionBarLeftColor = infractionColors.pop();
    }

    return payload;
  }
}

class Widget<TPayload> {
  constructor(readonly subcompositionId: string) {}
  payload: Partial<TPayload>;
}
const leftLightInfractionCompId = 'fc070e8a-bea1-4a76-a577-22f9f22307c6';
const headLightInfractionCompId = '8af04dc1-f884-4a16-9ebf-2be05251e54c';
const rightLightInfractionCompId = 'cf1e8966-98c6-7abb-9d03-f2beaccb92d4';

export const squatComposition = new Widget<SquatPayload>(
  '9b768806-7fd1-43b1-a6e6-adf1a706972b',
);

const benchComposition = new Widget<BenchPayload>(
  '117d6e66-ec38-4214-bf03-5af1e34afe17',
);

const deadliftComposition = new Widget<DeadliftPayload>(
  'b9b21c1e-5c7a-47e3-b524-271aa4318f91',
);

const bottomBarComposition = new Widget<BottomBarPayload>(
  '4b8a60fe-8f18-46f5-b829-0601f4a6a4d8',
);

const lightsComposition = new Widget<LightsPayload>(
  '4b8a60fe-8f18-46f5-b829-0601f4a6a4d8',
);

const isValueNullOrEmptyString = (value: any) => {
  return value === null || value === undefined || value === '';
};

const getLiftTextColor = (lift: Lift) => {
  if (!lift.weight && !lift.result) {
    return colors.mainOverlays.lift.future;
  }
  if (lift.weight && !lift.result) {
    return colors.mainOverlays.lift.current;
  }
  if (isLiftGood(lift)) {
    return colors.mainOverlays.lift.good;
  } else {
    return colors.mainOverlays.lift.bad;
  }
};
