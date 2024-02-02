import { SingularColor } from '../singularlive.payloads';

export class NextLiftersComp {
  compID = 'ba7bd7e4-945a-2b6e-0a21-b4cae80ae234';

  buildPayload(nextLifters: string[]) {
    return { nextLifters: JSON.stringify(nextLifters) };
  }
}

export type NextLiftersPayload = {
  ad: string;
  adSpotVisibility: boolean;
  adImageShift: number;
  numberBgColor: SingularColor;
  nextLifters: string[];
};
