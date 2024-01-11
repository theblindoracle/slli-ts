import { AnimationState } from './singularlive.enteties';

export type UpdateControlAppContentDTO<TPayload = any> = {
  subCompositionId: string;
  payload?: TPayload;
  state?: AnimationState;
};
