export class Widget<TPayload> {
  constructor(readonly subCompositionId: string) { }
  payload: Partial<TPayload>;
}
