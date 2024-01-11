import { Lift, RefDecision } from './liftingcast.enteties';

export const isLiftGood = (lift: Lift) => {
  return lift.result === 'good';
};

export const isRefDecisionGood = (decision: RefDecision) => {
  return decision === 'good';
};

export const getBestLiftWeight = (lifts: Lift[]) => {
  let bestLift = 0;
  lifts.forEach((lift) => {
    if (isLiftGood(lift)) {
      bestLift = lift.weight;
    }
  });
  return bestLift;
};
