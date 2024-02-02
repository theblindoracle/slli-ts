import {
  RefLightDecision,
  RefLights,
} from 'src/liftingcast/liftingcast.enteties';
import { isRefDecisionGood } from 'src/liftingcast/liftingcast.utils';
import { SingularColor } from '../singularlive.payloads';
import { colors } from '../singularlive.constants';

export class LightsComp {
  leftLightInfractionCompId = 'fc070e8a-bea1-4a76-a577-22f9f22307c6';
  headLightInfractionCompId = '8af04dc1-f884-4a16-9ebf-2be05251e54c';
  rightLightInfractionCompId = 'cf1e8966-98c6-7abb-9d03-f2beaccb92d4';

  lightsCompID = '0c44bb70-1af3-4f0d-bf06-dd0cf34b78bf';
  buildLightsPayload(refLights: RefLights) {
    const lightPayload: LightsPayload = {
      leftJudgeDecision: isRefDecisionGood(refLights.left.decision),
      headJudgeDecision: isRefDecisionGood(refLights.head.decision),
      rightJudgeDecision: isRefDecisionGood(refLights.right.decision),
      lastUpdate: new Date(),
    };
    return lightPayload;
  }
  buildLightInfractionPayload(refLightState: RefLightDecision) {
    const payload = {
      infractionFullBarColor: colors.liftInfactions.noInfaction,
      infractionBarRightColor: colors.liftInfactions.noInfaction,
      infractionBarLeftColor: colors.liftInfactions.noInfaction,
    };

    if (
      isRefDecisionGood(refLightState.decision) ||
      refLightState.cards === null
    ) {
      return payload;
    }
    if (refLightState.cards) {
      const infractionColors = [];
      if (refLightState.cards.red) {
        infractionColors.push(colors.liftInfactions.red);
      }
      if (!!refLightState.cards.blue) {
        infractionColors.push(colors.liftInfactions.blue);
      }
      if (!!refLightState.cards.yellow) {
        infractionColors.push(colors.liftInfactions.yellow);
      }
      if (infractionColors.length === 1) {
        payload.infractionFullBarColor = infractionColors.pop();
      } else if (infractionColors.length === 2) {
        payload.infractionBarRightColor = infractionColors.pop();
        payload.infractionBarLeftColor = infractionColors.pop();
      }
    }

    return payload;
  }
}

export type LightsPayload = {
  leftJudgeDecision: boolean;
  headJudgeDecision: boolean;
  rightJudgeDecision: boolean;
  lastUpdate: Date;
};

export type LightInfractionPayload = {
  infractionBarLeftColor: SingularColor;
  infractionBarRightColor: SingularColor;
  infractionFullBarColor: SingularColor;
};
