export class MeetDocument {
  name: string;
  units: string;
  lifters: Lifter[];
  platforms: Platform[];
  divisions: Division[];
}

export type ClockState = 'initial' | 'started';

export class RefLights {
  left?: RefLightDecision;
  head?: RefLightDecision;
  right?: RefLightDecision;
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
  memberNumber: string | null;
  name: string | null;
  gender: string | null;
  team: string | null;
  state: string | null;
  country: string | null;
  bodyWeight: number | null;
  lot: number | null;
  session: number | string | null;
  flight: string | null;
  squatRackHeight: string | null;
  benchRackHeight: string | null;
  platform: string | null;
  divisions: LifterDivision[];
  lifts: LifterLifts;
}

export class LifterDivision {
  divisionId: string | null;
  weightClassId: string | null;
  score: string | number | null;
  forecastedScore: string | number | null;
  place: number | null;
  forecastedPlace: number | null;
  total: number | null;
  forecastedTotal: number | null;
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
  name?: string;
  barAndCollarWeight?: number;
  currentAttempt?: Attempt;
  nextAttempts: Attempt[];
}

// {
//   id: string;
//   name: string | null;
//   barAndCollarsWeight: number | null;
//   currentAttempt: Attempt | null;
//   nextAttempts: Attempt[];
// }
export type LiftName = 'squat' | 'bench' | 'dead';

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
