export class WeightClassComp {
  compID = '6e18215a-f4f4-4dfa-88c1-ef0f17193d07';

  buildPayload(divisionName: string): WeightClassPayload {
    return { classTitle: divisionName };
  }
}

export type WeightClassPayload = {
  classTitle: string;
};
