import type { Metadata } from '../../lib/types.js';

export interface WalletClient {
  getBalance: (id: string, requestId: string) => Promise<{ balance: string }>;
  credit: (
    id: string,
    amount: number,
    requestId: string,
    metadata: Metadata
  ) => Promise<{ balance: string; transactionId: string }>;
  debit: (
    id: string,
    amount: number,
    requestId: string,
    metadata: Metadata
  ) => Promise<{ balance: string; transactionId: string }>;
}
