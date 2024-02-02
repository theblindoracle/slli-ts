export type SingularColor =
  | {
      r: number;
      g: number;
      b: number;
      a: number;
    }
  | string;

export type TimerControl = {
  UTC: number;
  isRunning: boolean;
  value: number;
};
