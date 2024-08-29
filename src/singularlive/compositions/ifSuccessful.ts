

export class IfSuccessfulComp {
  compID = '347106cc-e03a-4af0-a268-115880b39597'

  getOrdinalSuffix(n: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = n % 100;

    return n + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }

  buildPayload(currentPlace: number, moveToPlace: number): IfSuccessfulPayload {
    return {
      ifSuccessful: `if successful, will move from ${this.getOrdinalSuffix(currentPlace)} to ${this.getOrdinalSuffix(moveToPlace)}`
    }
  }
}

export type IfSuccessfulPayload = {
  ifSuccessful: string
}


