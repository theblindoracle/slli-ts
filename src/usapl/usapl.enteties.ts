export interface Division {
  readonly id?: number;
  name?: string;
  longName?: string;
}

export interface Lifter {
  readonly id?: number;
  readonly membershipId?: number;
  firstName?: string;
  lastName?: string;
  sex?: string;
}

export interface LifterProfile {
  lifter?: Lifter;
  records?: Array<Record>;
}

export interface RankingEntry {
  lifter?: Lifter;
  weight?: number;
  points?: number;
  position?: number;
}

export interface Record {
  readonly id?: number;
  recordList?: string;
  lifter?: Lifter;
  weight?: number;
  weightClass?: WeightClass;
  bodyWeight?: number;
  discipline?: string;
  division?: string;
  date?: string;
}

export interface WeightClass {
  readonly id?: number;
  name?: string;
  maxWeight?: number;
  sex?: string;
}
