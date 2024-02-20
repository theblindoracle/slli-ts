export class MeetDocument {
  name: string;
  units: string;
  lifters: Lifter[];
  platforms: Platform[];
  divisions: Division[];
}

export type ClockState = 'initial' | 'started';

export class RefLights {
  left: RefLightDecision;
  head: RefLightDecision;
  right: RefLightDecision;
}

export class RefLightDecision {
  decision?: RefDecision;
  cards?: RefDecisionCards;
}

export type RefDecision = 'good' | 'bad';

export class RefDecisionCards {
  red?: boolean;
  blue?: boolean;
  yellow?: boolean;
}

export type LightDoc = {
  _id: string;
  _rev: string;
  platformId: string;
  position: string;
  decision: RefDecision;
  cards: RefDecisionCards;
};

export class Lifter {
  id: string;
  name: string;
  gender: string;
  team: string;
  state: string;
  country: string;
  bodyWeight: number;
  lot: number;
  session: number;
  flight: string;
  squatRackHeight: string;
  benchRackHeight: string;
  platform: string;
  divisions: LifterDivision[];
  lifts: LifterLifts;
}

export class LifterDivision {
  divisionId?: string;
  weightClassId?: string;
  score?: number;
  forecastedScore?: number;
  place?: number;
  forecastedPlace?: number;
  total: number;
  forecastedTotal: number;
}

export class Lift {
  id: string;
  weight?: number;
  result?: string;
  // need to transform json from LC
  decisions?: RefLights;
}

export class LifterLifts {
  squat: Lift[];
  bench: Lift[];
  deadlift: Lift[];
}

export class Platform {
  id: string;
  name: string;
  barAndCollarWeight: number;
  currentAttempt?: Attempt;
  nextAttempts: Attempt[];
}

export type LiftName = 'squat' | 'bench' | 'deadlift';

export class Attempt {
  id: string;
  liftName: LiftName;
  attemptNumber: string;
  lifter: { id: string };
}

export class Division {
  id: string;
  name: string;
  scoreBy: string;
  weightClasses: WeightClass[];
}

export class WeightClass {
  id: string;
  name: string;
  maxWeight: number;
}
