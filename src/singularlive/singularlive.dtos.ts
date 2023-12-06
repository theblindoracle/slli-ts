import { AnimationState } from './singularlive.enteties';

export type UpdateControlAppContentDTO = {
  subcompositionId: string;
  payload?: any;
  state?: AnimationState;
};
