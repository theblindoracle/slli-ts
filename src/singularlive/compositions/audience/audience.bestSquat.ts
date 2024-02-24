export class BestSquatWidget {
  compId: string = '031ca1ae-181e-487c-8145-23da80e07202';

  buildPayload(bestSquat: number): BestSquatPayload {
    return { bestSquatNum: bestSquat };
  }
}

export class BestSquatPayload {
  bestSquatNum: number;
}
