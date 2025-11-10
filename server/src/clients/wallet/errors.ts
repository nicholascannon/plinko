/**
 * V1 Wallet API Known Errors
 */
export type HttpWalletClientErrorType =
  | 'WALLET_NOT_FOUND'
  | 'INVALID_DEBIT_AMOUNT'
  | 'INSUFFICIENT_FUNDS';

export class HttpWalletClientError extends Error {
  constructor(
    public readonly type: HttpWalletClientErrorType,
    public readonly payload: Record<string, any>,
    public readonly httpCode: number,
    public readonly walletId: string
  ) {
    super(type);
    this.name = 'HttpWalletClientError';
  }
}
