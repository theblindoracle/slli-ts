export class NextLifterWidget {
  compId: string = '8efdc414-d931-41bf-b835-649219f1ac6a';

  buildPayload(bestSquat: number): NextLifterPayload {
    return { nestLifterName: bestSquat };
  }
}

export class NextLifterPayload {
  nestLifterName: number;
}
