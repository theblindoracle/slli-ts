import { AnimationState } from './singularlive.enteties';

export type UpdateControlAppContentDTO<TPayload = any> = {
  subcompositionId: string;
  payload?: TPayload;
  state?: AnimationState;
};
