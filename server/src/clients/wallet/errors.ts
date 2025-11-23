/**
 * V1 Wallet API Known Errors
 */
export type WalletClientErrorType =
  | 'WALLET_NOT_FOUND'
  | 'INVALID_DEBIT_AMOUNT'
  | 'INSUFFICIENT_FUNDS';

export class WalletClientError extends Error {
  constructor(
    public readonly type: WalletClientErrorType,
    public readonly payload: Record<string, any>,
    public readonly httpCode: number,
    public readonly walletId: string,
    public readonly requestId?: string
  ) {
    super(type);
    this.name = 'HttpWalletClientError';
  }
}
