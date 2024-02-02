import { Lift } from 'src/liftingcast/liftingcast.enteties';
import { colors } from './singularlive.constants';
import { isLiftGood } from 'src/liftingcast/liftingcast.utils';

export const isValueNullOrEmptyString = (value: any) => {
  return value === null || value === undefined || value === '';
};

export const getLiftTextColor = (lift: Lift) => {
  if (!lift.weight && !lift.result) {
    return colors.mainOverlays.lift.future;
  }
  if (lift.weight && !lift.result) {
    return colors.mainOverlays.lift.current;
  }
  if (isLiftGood(lift)) {
    return colors.mainOverlays.lift.good;
  } else {
    return colors.mainOverlays.lift.bad;
  }
};

export const delay = async (delayMS: number) => {
  await new Promise((resolve) => setTimeout(resolve, delayMS));
};
