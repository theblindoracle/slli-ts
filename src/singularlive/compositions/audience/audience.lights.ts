import {
  RefLightDecision,
  RefLights,
} from 'src/liftingcast/liftingcast.enteties';
import { isRefDecisionGood } from 'src/liftingcast/liftingcast.utils';
import { colors } from 'src/singularlive/singularlive.constants';
import { SingularColor } from 'src/singularlive/singularlive.payloads';

export class LightsWidget {
  lightsCompID = '0c44bb70-1af3-4f0d-bf06-dd0cf34b78bf';
  leftLightInfractionCompId = 'fc070e8a-bea1-4a76-a577-22f9f22307c6';
  headLightInfractionCompId = '8af04dc1-f884-4a16-9ebf-2be05251e54c';
  rightLightInfractionCompId = 'cf1e8966-98c6-7abb-9d03-f2beaccb92d4';

  buildLightsPayload(refLights: RefLights) {
    return {
      rightJudgeDecision: isRefDecisionGood(refLights.right.decision),
      headJudgeDecision: isRefDecisionGood(refLights.head.decision),
      leftJudgeDecision: isRefDecisionGood(refLights.left.decision),
      lastUpdate: new Date(),
    };
  }
  buildLightInfractionPayload(refLightState: RefLightDecision) {
    const payload: LightInfractionPayload = {
      infractionFullBarColor: colors.liftInfactions.noInfaction,
      infractionBarRightColor: colors.liftInfactions.noInfaction,
      infractionBarLeftColor: colors.liftInfactions.noInfaction,
      infractionFullBarVisibility: false,
      infractionBarLeftVisibility: false,
      infractionBarRightVisibility: false,
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
        payload.infractionFullBarVisibility = true;
        payload.infractionBarLeftVisibility = false;
        payload.infractionBarRightVisibility = false;
      } else if (infractionColors.length === 2) {
        payload.infractionBarRightColor = infractionColors.pop();
        payload.infractionBarLeftColor = infractionColors.pop();
        payload.infractionFullBarVisibility = false;
        payload.infractionBarLeftVisibility = true;
        payload.infractionBarRightVisibility = true;
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
  infractionBarLeftVisibility: boolean;
  infractionBarRightVisibility: boolean;
  infractionFullBarVisibility: boolean;
};
