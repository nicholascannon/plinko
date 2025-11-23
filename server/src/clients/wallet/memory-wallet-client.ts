import type { WalletClient } from './wallet-client.js';

export class MemoryWalletClient implements WalletClient {
  private readonly balances: Record<string, number> = {};

  constructor(seed: Record<string, number> = {}) {
    this.balances = seed;
  }

  public async getBalance(
    id: string,
    _requestId: string
  ): Promise<{ balance: string }> {
    return { balance: this.balances[id]?.toString() ?? '0' };
  }

  public async credit(
    id: string,
    amount: number,
    _requestId: string
  ): Promise<{ balance: string; transactionId: string }> {
    this.balances[id] = (this.balances[id] ?? 0) + amount;
    return {
      balance: this.balances[id]?.toString() ?? '0',
      transactionId: 'credit-txn-id',
    };
  }

  public async debit(
    id: string,
    amount: number,
    _requestId: string
  ): Promise<{ balance: string; transactionId: string }> {
    this.balances[id] = (this.balances[id] ?? 0) - amount;
    return {
      balance: this.balances[id]?.toString() ?? '0',
      transactionId: 'debit-txn-id',
    };
  }
}
