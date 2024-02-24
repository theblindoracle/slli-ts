export class BestBenchWidget {
  compId: string = 'c9d0fadc-553b-4c69-b547-f49288e69fe9';

  buildPayload(bestSquat: number): BestBenchPayload {
    return { bestBPNum: bestSquat };
  }
}

export class BestBenchPayload {
  bestBPNum: number;
}
