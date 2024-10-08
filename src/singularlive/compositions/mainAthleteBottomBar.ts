import { Attempt, Lift, Lifter } from 'src/liftingcast/liftingcast.enteties';
import { SingularColor } from '../singularlive.payloads';
import { colors } from '../singularlive.constants';
import {
  getLiftTextColor,
  isValueNullOrEmptyString,
} from '../singularlive.utils';
import { isLiftGood } from 'src/liftingcast/liftingcast.utils';
import { Ranking } from 'src/rankings/rankings.entity';

export class MainAthleteBottomBar {
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

    const url = teamImageUrlMap.get(currentLifter.team ? currentLifter.team.toUpperCase() : "");
    if (url) {
      bottomBarPayload.teamImgURL = url;
      bottomBarPayload.teamVis = true;
    } else {
      bottomBarPayload.teamImgURL = undefined;
      bottomBarPayload.teamVis = false;
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
  teamImgURL: string;
  teamVis: boolean;
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

export const teamImageUrlMap = new Map<string, string>([
  [
    'UC DAVIS',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3nl3gIXJvCvQawoTQNwHo1_w1000h562.png',
  ],
  [
    'UNIVERSITY OF ALABAMA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4duadDCuitNta1AI2ZVVXx_w1000h562.png',
  ],
  [
    'ARMY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7AmXefq4AWqUGYswyO2ZcH_w1000h562.png',
  ],
  [
    'AUBURN UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2rVFT4mKw4h5zw4sRQxA8f_w1000h562.png',
  ],
  [
    'AUGUSTA UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3whhUzNwb67BhFuwTtjzyj_w1000h562.png',
  ],
  [
    'SAN DIEGO STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6jNyjN7AAE3egmaP8TpA9G_w1000h562.png',
  ],
  [
    'UNIVERSITY OF WISCONSIN - MADISON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3Smocitm2Yc9554KmnmsyL_w1000h562.png',
  ],
  [
    'BINGHAMTON UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3A6YvHuoRpYYex4WZEQCLe_w1000h562.png',
  ],
  [
    'DUKE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7MFs5nFFFewWWZGHjwipbu_w1000h562.png',
  ],
  [
    'BLUE MOUNTAIN CHRISTIAN UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4hZ2bVSxjlLqbgpEnoez5g_w1000h562.png',
  ],
  [
    'BOSTON UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/79LFBVhqgiW76r1uGxSjqV_w1000h562.png',
  ],
  [
    'EAST TENNESSEE STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1Y0qkyyMgKELBL7m98YqYd_w1000h562.png',
  ],
  [
    'CARNEGIE MELLON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/21RgCHZ4Wh9T9MI7rAxpOU_w1000h562.png',
  ],
  [
    'UNIVERSITY OF GEORGIA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3cf6mcBIwqo09v4cSuos0e_w1000h562.png',
  ],
  [
    'CLEMSON UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4vQ0zm7kVJt34ESyUDhd1d_w1000h562.png',
  ],
  [
    'UNIVERSITY OF PITTSBURGH',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2SY2kvu7mfs57SSwNIzFFY_w1000h562.png',
  ],
  [
    'CALDWELL COLLEGE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/44QQ4kkHQSiOLVaHyjT9x0_w1000h562.png',
  ],
  [
    'COLORADO COLLEGE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/26nycY895fpKckRbwPGGnC_w1000h562.png',
  ],
  [
    'CONCORDIA UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3dXYRAmhHCzBQRbiQ6izl0_w1000h562.png',
  ],
  [
    'CORNELL',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1NUhhZySQYEp5O7PSvRlcO_w1000h562.png',
  ],
  [
    'CSU - SAN MARCOS',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6YBsP01oysQqfH62yJ3MuT_w1000h562.png',
  ],
  [
    'CU BOULDER',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5d8eStbrxiEGLQJwpIpHPL_w1000h562.png',
  ],
  [
    'CU DENVER',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3wTsrZu6R0GrX9rqCSeBo0_w1000h562.png',
  ],
  [
    'DARTMOUTH',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2BPH133cnlXvDH87Sja4nQ_w1000h562.png',
  ],
  [
    'DAVENPORT UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/0SCdKLX8D74p8TUJVcRrWA_w1000h562.png',
  ],
  [
    'DEPAUL UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6ipydVsgnrQTm8JmnkWvkN_w1000h562.png',
  ],
  [
    'DREXEL UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4WAt1ErpbR9fQXTXQClDpu_w1000h562.png',
  ],
  [
    'EAST CENTRAL UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7eu3DDmM7tcJNWYhTAsDbK_w1000h562.png',
  ],
  [
    'FLORIDA GULF COAST UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5adcvZs4oHuUk8EnRzOGHA_w1000h562.png',
  ],
  [
    'FLORIDA INTERNATIONAL UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/30mmsnQu5oCcWCtFzVbFKZ_w1000h562.png',
  ],
  [
    'FLORIDA INTERNATIONAL UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/30mmsnQu5oCcWCtFzVbFKZ_w1000h562.png',
  ],
  [
    'FLORIDA STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7e93XKkzWr22WwGAI4A1VD_w1000h562.png',
  ],
  [
    'FRIENDS UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7jex8vZCBgEUXW7T3D1Av7_w1000h562.png',
  ],
  [
    'UNIVERSITY OF SOUTH CAROLINA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3NQz85Cn4k3mNOSUAfvKO8_w1000h562.png',
  ],
  [
    'UNIVERSITY OF FLORIDA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7pe5ivW7TCk9bfbZq7F50o_w1000h562.png',
  ],
  [
    'GEORGE MASON UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6OgvxZqZ1pjwNGeS3PZuuL_w1000h562.png',
  ],
  [
    'GEORGIA STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/793hYfbDxyNxpSo7AXaRRd_w1000h562.png',
  ],
  [
    'GEORGIA TECH',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6w7JSGLuOqMIs2MJLLP6CG_w1000h562.png',
  ],
  [
    'UNIVERSITY OF WASHINGTON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7trW56IbBFvGDXxfDDERCg_w1000h562.png',
  ],
  [
    'INDIANA UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2WCo4YMAY8lgGgueQg6EoY_w1000h562.png',
  ],
  [
    'INDIANA UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2WCo4YMAY8lgGgueQg6EoY_w1000h562.png',
  ],
  [
    'TEXAS A&M - KINGSVILLE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4OvjTLnJ8lhJQu2YkQxKFY_w1000h562.png',
  ],
  [
    'JOHNS HOPKINS UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3FfsSs1JJloBddy8uOakPs_w1000h562.png',
  ],
  [
    'KENNESAW STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2d61FTwLhPdgmx8yVVxye0_w1000h562.png',
  ],
  [
    'LIBERTY UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4EIkvEKow7NqKn1fKV9n1v_w1000h562.png',
  ],
  [
    'UC BERKELEY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7ECf24ABnf9H6njEI0ZyWR_w1000h562.png',
  ],
  [
    'LOUISIANA TECH',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/18ZVZYH2Igq4TQaOKUUfTb_w1000h562.png',
  ],
  [
    'MASSACHUSETTS INSTITUTE OF TECHNOLOGY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5joYXLPwiuhJLFpdzj6fv8_w1000h562.png',
  ],
  [
    'TEXAS TECH',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6LhLaiw8yQWZV33qZzVF7h_w1000h562.png',
  ],
  [
    'MCKENDREE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4L1OBgwrrYYoryUvRPDp4k_w1000h562.png',
  ],
  [
    'YALE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3Fa152OjjeNLdM18wZpekS_w1000h562.png',
  ],
  [
    'MIAMI UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/58SslQrh6eSjP2A02fX5xI_w1000h562.png',
  ],
  [
    'MIAMI UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/58SslQrh6eSjP2A02fX5xI_w1000h562.png',
  ],
  [
    'MICHIGAN STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4MlNO56UkrF2urTmre0Ngn_w1000h562.png',
  ],
  [
    'MIDLAND UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7g24pTdJKFGZyk0uo5Nt25_w1000h562.png',
  ],
  [
    'UNIVERSITY OF WISCONSIN - MILWAUKEE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/41ZsRbheyxxBAs0aM3yPMX_w1000h562.png',
  ],
  [
    'MISSISSIPPI STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4kzv9XdVsIYJqcBwuF10sj_w1000h562.png',
  ],
  [
    'MISSOURI VALLEY COLLEGE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2FBVE8ECaFN3gClmoPTrsd_w1000h562.png',
  ],
  [
    'SOUTHERN METHODIST UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7yd7ZvT3uGs6mujC9rM4n4_w1000h562.png',
  ],
  [
    'NICHOLLS STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6GK7i2OJDuo8OmJhBOwYyU_w1000h562.png',
  ],
  [
    'NICHOLLS STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6GK7i2OJDuo8OmJhBOwYyU_w1000h562.png',
  ],
  [
    'NEW JERSEY INSTITUTE OF TECHNOLOGY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6bvJsv2d8sZDlTVy10Ol3i_w1000h562.png',
  ],
  [
    'NORTHEASTERN UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6pnbvDomJvhOfF7EbBblsh_w1000h562.png',
  ],
  [
    'NORTHEASTERN UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6pnbvDomJvhOfF7EbBblsh_w1000h562.png',
  ],
  [
    'OKLAHOMA STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/53eTAoT2RZPZtJssl9HMTA_w1000h562.png',
  ],
  [
    'THE OHIO STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6XzftOU6ijyJjvizGwhFAo_w1000h562.png',
  ],
  [
    'OTTAWA UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6virtx70M9f3WDe4Ox7suD_w1000h562.png',
  ],
  [
    'PENN STATE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/78GRlW9VW07dTN2rIrPnl0_w1000h562.png',
  ],
  [
    'UNIVERSITY OF PENNSYLVANIA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6r5fsk4AOnQkU4gwbLNk4X_w1000h562.png',
  ],
  [
    'UC IRVINE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6JhisBPxvwILr2bwcCJiX0_w1000h562.png',
  ],
  [
    'UC IRVINE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6JhisBPxvwILr2bwcCJiX0_w1000h562.png',
  ],
  [
    'UNIVERSITY OF ILLINOIS CHICAGO',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3txDxqxKVQ0ervD64GDFYW_w1000h562.png',
  ],
  [
    'UNIVERSITY OF MINNESOTA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2fJh00afERLzc4vTDEQfwQ_w1000h562.png',
  ],
  [
    'GEORGIA SOUTHERN UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2XYBk18Z14VUAeydMoXJc8_w1000h562.png',
  ],
  [
    'OREGON STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7q2uUt3bwVLV7AU793xzvG_w1000h562.png',
  ],
  [
    'UNIVERSITY OF VIRGINIA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7zEPGi7pD5eFTxcZct6fGs_w1000h562.png',
  ],
  [
    'VIRGINIA TECH',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7ao6gE0FnpqzticlMozMv4_w1000h562.png',
  ],
  [
    'NOTRE DAME',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6X7MIQ0dlK9OmOR1fzVJj4_w1000h562.png',
  ],
  [
    'PRINCETON UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2dfR83VJrE7zvJuDZpeZzP_w1000h562.png',
  ],
  [
    'PURDUE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1E88Gfcaudb60pdqv93P3T_w1000h562.png',
  ],
  [
    'QUINNIPIAC UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1NnocYLQw92wxC8UyuFZdd_w1000h562.png',
  ],
  [
    'ROCHESTER INSTITUTE OF TECHNOLOGY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/69qM4tkCyr5NgCpUWNoYQL_w1000h562.png',
  ],
  [
    'ROANOKE COLLEGE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5e1nC0mU7IYsCHAOIYYFmS_w1000h562.png',
  ],
  [
    'RUTGERS UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1axiht3XuEf50zigmbcjrx_w1000h562.png',
  ],
  [
    'SAM HOUSTON STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1yElHz4NppQCcohSCSOIEB_w1000h562.png',
  ],
  [
    'UNC WILMINGTON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2NcniJ8ubuxio8uUxfGEgA_w1000h562.png',
  ],
  [
    'SLIPPERY ROCK UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2810Ivvbk3EnX5artpfJz9_w1000h562.png',
  ],
  [
    'SLIPPERY ROCK UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2810Ivvbk3EnX5artpfJz9_w1000h562.png',
  ],
  [
    'SAN JOSE STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4bcZYN6IBd8TDo7nV66noA_w1000h562.png',
  ],
  [
    'STEVENS INSTITUTE OF TECHNOLOGY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6DrLBPgWr2lP4uWRLkn6qI_w1000h562.png',
  ],
  [
    'TARLETON STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6Fz3qu9MO4QMFwso2gtZux_w1000h562.png',
  ],
  [
    'TEXAS A&M',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4R5ffHQmrBw1cx03N3NlxM_w1000h562.png',
  ],
  [
    'TEXAS STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1wvFHeSKPwUm40JT4MNi5V_w1000h562.png',
  ],
  [
    'THE UNIVERSITY OF TEXAS AT AUSTIN',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/49yg2iXjeSw5gkqqvbPWeP_w1000h562.png',
  ],
  [
    'THE UNIVERSITY OF TOLEDO',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4kcUSC2xPnWQGrycWSXlXc_w1000h562.png',
  ],
  [
    'CSU FULLERTON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7JwltNtRaBchUJyxpChOvr_w1000h562.png',
  ],
  [
    'TRINITY UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5ibAJQH7fXi4eymcRSYAew_w1000h562.png',
  ],
  [
    'UC SAN DIEGO',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3bkqyHYE1OiOd9mYhLxYw9_w1000h562.png',
  ],
  [
    'UCLA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3yslionWXOK3fQ2m3X2VzN_w1000h562.png',
  ],
  [
    'UC SANTA BARBARA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/75ZkG6770xDw91hxgQRafc_w1000h562.png',
  ],
  [
    'UMASS AMHERST',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1YDVxg3KemylrRGHaTnXAt_w1000h562.png',
  ],
  [
    'UMASS BOSTON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5WEfGGHaP57bIeBBSxrbZV_w1000h562.png',
  ],
  [
    'UMASS LOWELL',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3Ht1VNYcVxqaWpZtYhryLD_w1000h562.png',
  ],
  [
    'UNIVERSITY OF NORTH FLORIDA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/0No8F96QJBuz5pO1D8HiuI_w1000h562.png',
  ],
  [
    'UNITED STATES NAVAL ACADEMY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/62teczTfKZyUhP5qUNHNt3_w1000h562.png',
  ],
  [
    'UNIVERSITY OF ARIZONA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5N5sL3a4Z89QhfMAFLMl98_w1000h562.png',
  ],
  [
    'UNIVERSITY OF CINCINNATI',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1hkbs5CBeI60hhHEEHfMKA_w1000h562.png',
  ],
  [
    'UNIVERSITY OF DELAWARE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2gYDZW1k1g1r6JJL7ZATRs_w1000h562.png',
  ],
  [
    'UNIVERSITY OF HAWAII AT MANOA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2b56rnzHXgWnH7yVwKMYTk_w1000h562.png',
  ],
  [
    'UNIVERSITY OF HOUSTON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5gKVMXTudVkv6dzYCm6gcy_w1000h562.png',
  ],
  [
    'UNIVERSITY OF LOUISIANA AT LAFAYETTE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2lEWqf99iOFa11dm6iPrir_w1000h562.png',
  ],
  [
    'UNIVERSITY OF MARYLAND',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7pG4tYhydUwb7leu4Qhttm_w1000h562.png',
  ],
  [
    'UNIVERSITY OF MIAMI',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5x9ovmVXGE046cYS8NSsw0_w1000h562.png',
  ],
  [
    'UNIVERSITY OF MIAMI',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5x9ovmVXGE046cYS8NSsw0_w1000h562.png',
  ],
  [
    'UNIVERSITY OF MICHIGAN',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7CssVPw0uHqUFnTddhfAcp_w1000h562.png',
  ],
  [
    'UNIVERSITY OF NEBRASKA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1HVR8mixiBa2uAICAPry37_w1000h562.png',
  ],
  [
    'UNIVERSITY OF OKLAHOMA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6uhqpbgmM04cNUTstjpGNy_w1000h562.png',
  ],
  [
    'UNIVERSITY OF OREGON',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5qf2sJvXdQiIMK4h7L7tk6_w1000h562.png',
  ],
  [
    'UNIVERSITY OF TEXAS - SAN ANTONIO',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7rW9LGAcp2HYkYrG5GyMLw_w1000h562.png',
  ],
  [
    'UNLV',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6j75CrNkQnSX80IigcXBfn_w1000h562.png',
  ],
  [
    'UNIVERSITY OF NORTH TEXAS',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/0OLFTSXr4AwDtLxUwSBjBB_w1000h562.png',
  ],
  [
    'AIR FORCE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3xAfQRSjdcRvD7XZAWPtwB_w1000h562.png',
  ],
  [
    'UNIVERSITY OF SOUTH FLORIDA',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3udOv3Ao33jjtzObKkatAf_w1000h562.png',
  ],
  [
    'UTAH STATE UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/5G3aT9o19FEPc7uVsDseg3_w1000h562.png',
  ],
  [
    'UT DALLAS',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1er5bNvoR3uUoWoEaKjZVU_w1000h562.png',
  ],
  [
    'UNIVERSITY OF TENNESSEE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7ma21R6z4Vyqce2Rt7VElv_w1000h562.png',
  ],
  [
    'UNIVERSITY OF WISCONSIN - STOUT',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1y8tgsIlNPAhkzF19UohMf_w1000h562.png',
  ],
  [
    'UNIVERSITY OF WISCONSIN - LA CROSSE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4RHbMYpbn8Tiv7je9d9eCq_w1000h562.png',
  ],
  [
    'VCU',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/4bzl4wNDKFID1quxfgH1Lb_w1000h562.png',
  ],
  [
    'WASHINGTON UNIVERSITY IN ST. LOUIS',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1i5pfrIGTYX3OMK1EAe1Kr_w1000h562.png',
  ],
  [
    'WEST VIRGINIA UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/1QVgSGM7UlHTKKrRqcYR9d_w1000h562.png',
  ],
  [
    'UNIVERSITY OF KENTUCKY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/3EfnbIYNcsRogt3NwYyqtV_w1000h562.png',
  ],
  [
    'WILLIAM JEWELL COLLEGE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/0p2pjVR2YlylR0Qh0OEsXp_w1000h562.png',
  ],
  [
    'YALE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/0qbp6TcfPTk2gvV5glHcOA_w1000h562.png',
  ],
  [
    'WORCESTER POLYTECHNIC INSTITUTE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/7hpk71hIyPWzrEFHwvyGqO_w1000h562.png',
  ],
  [
    'WESTERN WASHINGTON UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2CqMWtcx7DiJxI4VuwvUra_w1000h562.png',
  ],
  [
    'UNIVERSITY OF LOUISIANA AT MONROE',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/2foIt9RXMlrVChbxArlOXB_w1000h562.png',
  ],
  [
    'UNIVERSITY OF ILLINOIS URBANA-CHAMPAIGN',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6NKaDcmqXwPI9B4jJbavuV_w1000h562.png',
  ],
  [
    'ROWAN UNIVERSITY',
    'https://image.singular.live/ebf615e75cd01b7f8fbda8d0cff31972/images/6vv49PH75TYFFmQ6vQxBeV_w1000h562.png',
  ],
]);
