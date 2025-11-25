declare global {
  interface DocumentEventMap {
    [BalanceUpdateEvent.TYPE]: BalanceUpdateEvent;
  }
}

type Payload =
  | { balance: string; delta?: undefined }
  | { balance?: undefined; delta: number };

export class BalanceUpdateEvent extends CustomEvent<Payload> {
  public static readonly TYPE = 'balanceUpdate';

  constructor(payload: Payload) {
    super(BalanceUpdateEvent.TYPE, {
      detail: payload,
    });
  }
}

export function dispatchBalanceUpdateEvent(payload: Payload) {
  document.dispatchEvent(new BalanceUpdateEvent(payload));
}
