import { Attempt, Lift, Lifter } from 'src/liftingcast/liftingcast.enteties';
import { SingularColor } from '../singularlive.payloads';
import { colors } from '../singularlive.constants';
import {
  getLiftTextColor,
  isValueNullOrEmptyString,
} from '../singularlive.utils';
import { isLiftGood } from 'src/liftingcast/liftingcast.utils';
import { Ranking } from 'src/rankings/rankings.entity';

export class ExpMainAthleteBottomBar {
  squatCompID = '037b4505-1ef3-46cd-9354-12ad4963dc8f';
  benchCompID = '83e4674b-0afe-42bc-b449-94c5391cf0d8';
  deadliftCompID = '597ee421-2a27-4ef9-8259-df65376f74ba';
  weightClassCompID = '3d5212b1-c977-47ed-a2f8-ee5766dabdc6';
  mainAthleteBottomBarCompID = '9b098dbd-e8ea-4479-ad16-3dd0f3248098';

  buildMainAtleteBottomBarPayload = (
    currentLifter: Lifter,
    currentLifterRank: Ranking,
    currentAttempt: Attempt,
  ) => {
    const bottomBarPayload: Partial<BottomBarPayload> = {};

    bottomBarPayload.athleteName = currentLifter.name;

    if (currentAttempt.liftName === 'squat') {
      bottomBarPayload.isSquatActive = true;
      bottomBarPayload.isBenchActive = false;
      bottomBarPayload.isDeadliftActive = false;
    } else if (currentAttempt.liftName === 'bench') {
      bottomBarPayload.isSquatActive = false;
      bottomBarPayload.isBenchActive = true;
      bottomBarPayload.isDeadliftActive = false;
    } else {
      bottomBarPayload.isSquatActive = false;
      bottomBarPayload.isBenchActive = false;
      bottomBarPayload.isDeadliftActive = true;
    }
    if (currentAttempt.attemptNumber === '1') {
      bottomBarPayload.attempt1Active = true;
      bottomBarPayload.attempt2Active = false;
      bottomBarPayload.attempt3Active = false;
    } else if (currentAttempt.attemptNumber === '2') {
      bottomBarPayload.attempt1Active = false;
      bottomBarPayload.attempt2Active = true;
      bottomBarPayload.attempt3Active = false;
    } else if (currentAttempt.attemptNumber === '3') {
      bottomBarPayload.attempt1Active = false;
      bottomBarPayload.attempt2Active = false;
      bottomBarPayload.attempt3Active = true;
    } else {
      bottomBarPayload.attempt1Active = false;
      bottomBarPayload.attempt2Active = false;
      bottomBarPayload.attempt3Active = false;
    }

    if (currentLifterRank && currentLifterRank.position <= 25) {
      bottomBarPayload.athleteRank = currentLifterRank.position;
      bottomBarPayload.showAthleteRank = true;
    } else {
      bottomBarPayload.showAthleteRank = false;
    }

    return bottomBarPayload;
  };

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

  buildAttemptString(attempt: Lift) {
    return isLiftGood(attempt) ? attempt.weight : `-${attempt.weight}`;
  }

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

  buildWeightClassPayload(
    classTitle: string,
    weightClass: string,
  ): WeightClassPayload {
    return {
      classTitle,
      weightClass: `${weightClass} KG`,
    };
  }
}

export type BottomBarPayload = {
  logoType: string;
  athleteName: string;
  athleteRank: number;
  showAthleteRank: boolean;
  attempt1Active: boolean;
  attempt2Active: boolean;
  attempt3Active: boolean;
  openingTitle: string;
  attempt1RectXPos: number;
  attempt2RectXPos: number;
  attempt3RectXPos: number;
  nameFieldWidth: number;
  isSquatActive: boolean;
  isBenchActive: boolean;
  isDeadliftActive: boolean;
};

export type SquatPayload = {
  squat1: string | number;
  squat2: string | number;
  squat3: string | number;
  squat1Color: SingularColor;
  squat2Color: SingularColor;
  squat3Color: SingularColor;
};

export type BenchPayload = {
  bench1: string | number;
  bench2: string | number;
  bench3: string | number;
  bestSquat: string | number;
  bench1Color: SingularColor;
  bench2Color: SingularColor;
  bench3Color: SingularColor;
};

export type DeadliftPayload = {
  deadlift1: string | number;
  deadlift2: string | number;
  deadlift3: string | number;
  bestSquat: string | number;
  bestBench: string | number;
  deadlift1Color: SingularColor;
  deadlift2Color: SingularColor;
  deadlift3Color: SingularColor;
};

export type WeightClassPayload = {
  classTitle: string;
  weightClass: string;
};
