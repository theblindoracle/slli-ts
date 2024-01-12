export type BottomBarPayload = {
  logoType: string;
  athleteName: string;
  athleteRank: string;
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

export type LightsPayload = {
  leftJudgeDecision: boolean;
  headJudgeDecision: boolean;
  rightJudgeDecision: boolean;
  lastUpdate: Date;
};

export type LightInfractionPayload = {
  infractionBarLeftColor: SingularColor;
  infractionBarRightColor: SingularColor;
  infractionFullBarColor: SingularColor;
};

export type WeightClassPayload = {
  classTitle: string;
};

type SingularColor =
  | {
      r: number;
      g: number;
      b: number;
      a: number;
    }
  | string;
