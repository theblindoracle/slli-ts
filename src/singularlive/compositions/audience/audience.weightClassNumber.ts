import { Lifter } from 'src/liftingcast/liftingcast.enteties';
import { colors } from 'src/singularlive/singularlive.constants';
import { SingularColor } from 'src/singularlive/singularlive.payloads';

export class WeightClassNumberWidget {
  compID = 'a6efa2b4-2e87-42fa-bcac-827bffbb76e9';

  buildPayload(
    currentLifter: Lifter,
    divisionNames: string[],
    equipmentLevel: string,
    weightClassName: string,
  ): WeightClassNumberPayload {
    const { bgFill, bgStroke, font } = getSexColors(currentLifter.gender);
    // should we be passing in lifter here?

    const divisionLabel =
      divisionNames.length === 2
        ? `${divisionNames[0]}\n${divisionNames[1]}`
        : divisionNames[0];

    return {
      sexLabel: currentLifter.gender,
      weightClassNumber: `${weightClassName} KG`,
      equipmentLabel: equipmentLevel,
      sexBgStrokeColor: bgStroke,
      sexBgFillColor: bgFill,
      sexLabelTextColor: font,
      weightClass: divisionLabel,
    };
  }
}

const getSexColors = (sex: string) => {
  if (sex.toUpperCase() === 'MALE') {
    return colors.sex.male;
  } else if (sex.toUpperCase() === 'FEMALE') {
    return colors.sex.female;
  } else {
    return colors.sex.mx;
  }
};
export class WeightClassNumberPayload {
  sexLabel: string;
  weightClassNumber: string;
  equipmentLabel: string;
  sexBgFillColor: SingularColor;
  sexBgStrokeColor: SingularColor;
  sexLabelTextColor: SingularColor;
  weightClass: string;
}
